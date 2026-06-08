import { CombatState } from '../state.js';
import { uiRegistry } from '../ui/ui-shared.js';
import { 
  applyIncomingDelta, 
  SYNC_PROTOCOL_VERSION, 
  initializeCaches, 
  getPCStateDiff, 
  getEncounterStateDiff,
  clearCachedPCState
} from './SyncProtocol.js';
import { hostQueue, clientQueue } from './MessageQueue.js';
import { connectionMonitor } from './ConnectionMonitor.js';
import { showCustomAlert } from '../ui/components/dialogs.js';

let peerInstance = null;

function getPeerOptions() {
  try {
    const customHost = localStorage.getItem('dd_peer_broker_host');
    const customPort = localStorage.getItem('dd_peer_broker_port');
    if (customHost) {
      return {
        host: customHost,
        port: parseInt(customPort) || 9000,
        path: '/'
      };
    }
  } catch (e) {
    console.error('Failed to load custom peer options:', e);
  }
  return {}; // Default public PeerJS broker (0.peerjs.com)
}

let reconnectCount = 0;
let isReconnecting = false;
let reconnectTimer = null;

function showReconnectBanner(attempt) {
  const banner = document.getElementById('reconnectBanner');
  const counter = document.getElementById('reconnectAttempts');
  if (banner) banner.style.display = 'block';
  if (counter) counter.textContent = `${attempt}/5`;
}

function hideReconnectBanner() {
  const banner = document.getElementById('reconnectBanner');
  if (banner) banner.style.display = 'none';
}

export function cleanupPeer() {
  connectionMonitor.stop();
  hostQueue.clear();
  clientQueue.clear();

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (peerInstance) {
    try {
      peerInstance.destroy();
    } catch (e) {
      console.error('Error destroying peer:', e);
    }
    peerInstance = null;
  }
  const s = CombatState.getState();
  if (s.session) {
    s.session.connections = [];
  }
}

export function removeConnection(conn) {
  const s = CombatState.getState();
  if (s.session && Array.isArray(s.session.connections)) {
    s.session.connections = s.session.connections.filter(c => c !== conn);
  }
  if (!s.session || !s.session.connections || s.session.connections.length === 0) {
    connectionMonitor.stop();
  }
}

export function sendEncounterStateToClient(conn) {
  const stateToSync = CombatState.getState();
  const packet = {
    type: 'full_sync_response',
    state: {
      meta: stateToSync.meta,
      combatants: stateToSync.combatants,
      turn: stateToSync.turn,
      round: stateToSync.round,
      concentrations: stateToSync.concentrations
    }
  };
  try {
    conn.send(packet);
  } catch (e) {
    console.error('Failed to send full sync state to client:', conn.peer, e);
  }
}

// Low-level immediate network send functions
function broadcastToClientsDirect(packet) {
  const s = CombatState.getState();
  if (s.session && s.session.role === 'host' && Array.isArray(s.session.connections)) {
    let sentCount = 0;
    let errorOccurred = null;

    s.session.connections.forEach(conn => {
      if (conn && conn.open) {
        try {
          conn.send(packet);
          sentCount++;
        } catch (e) {
          console.error('Failed to send packet to client:', conn.peer, e);
          errorOccurred = e;
        }
      }
    });

    if (s.session.connections.length > 0 && sentCount === 0) {
      throw errorOccurred || new Error('All client connections are closed.');
    }
  }
}

function sendToHostDirect(packet) {
  const s = CombatState.getState();
  if (s.session && s.session.role === 'client' && Array.isArray(s.session.connections)) {
    const conn = s.session.connections[0];
    if (conn && conn.open) {
      try {
        conn.send(packet);
      } catch (e) {
        console.error('Failed to send packet to host:', e);
        throw e;
      }
    } else {
      throw new Error('WebRTC connection to host is not open or not initialized.');
    }
  } else {
    throw new Error('No active client session or connections array found.');
  }
}

// Queue-wrapped public broadcast/send functions
export function broadcastToClients(packet) {
  hostQueue.enqueue(packet);
}

export function sendToHost(packet) {
  clientQueue.enqueue(packet);
}

// Set up queues with their direct transport send functions
hostQueue.setSendFunction(broadcastToClientsDirect);
clientQueue.setSendFunction(sendToHostDirect);

// Connect ConnectionMonitor to transport layer
connectionMonitor.setSendFunction((packet) => {
  const s = CombatState.getState();
  if (s.session) {
    if (s.session.role === 'host') {
      broadcastToClientsDirect(packet);
    } else if (s.session.role === 'client') {
      sendToHostDirect(packet);
    }
  }
});

export function handleIncomingData(conn, data) {
  if (!data || !data.type) return;

  // Handle connection pings immediately in the transport layer
  if (data.type === 'heartbeat_ping') {
    try {
      conn.send({ type: 'heartbeat_pong', timestamp: data.timestamp });
    } catch (e) {
      console.error('Failed to respond to heartbeat ping:', e);
    }
    return;
  }

  if (data.type === 'heartbeat_pong') {
    connectionMonitor.onPong(data);
    return;
  }

  const s = CombatState.getState();
  const role = s.session ? s.session.role : 'choice';
  applyIncomingDelta(data, role, conn);
}

export function initializeHostPeer(roomCode) {
  cleanupPeer();
  const peerId = `combatsheet-host-${roomCode}`;
  console.log('Initializing Host Peer with ID:', peerId);
  
  const options = getPeerOptions();
  try {
    peerInstance = new Peer(peerId, options);
  } catch (e) {
    console.error('Failed to create Peer instance:', e);
    showCustomAlert('Verbindungsfehler', 'PeerJS konnte nicht initialisiert werden: ' + e.message);
    return;
  }

  peerInstance.on('open', id => {
    console.log('Host Peer successfully registered on Broker Server with ID:', id);
  });

  peerInstance.on('connection', conn => {
    console.log('Incoming client connection request:', conn.peer);
    
    conn.on('open', () => {
      console.log('Connection established with client:', conn.peer);
      const s = CombatState.getState();
      if (s.session && Array.isArray(s.session.connections)) {
        s.session.connections.push(conn);
      }
      
      // Handshake: Exchange protocol versions
      conn.send({ type: 'hello', version: SYNC_PROTOCOL_VERSION });

      // Transmit authoritative DM state to client (full sync)
      sendEncounterStateToClient(conn);
      
      // Start/Refresh heartbeat pinging
      connectionMonitor.start();
      
      // Synchronize Host diff caches
      initializeCaches();

      conn.on('data', data => {
        handleIncomingData(conn, data);
      });

      conn.on('close', () => {
        console.log('Client closed connection:', conn.peer);
        removeConnection(conn);
      });

      conn.on('error', err => {
        console.error('Client connection error:', err);
        removeConnection(conn);
      });
    });
  });

  peerInstance.on('error', err => {
    console.error('Host Peer error:', err);
    showCustomAlert('Verbindungsfehler (Host)', err.message);
    cleanupPeer();
    CombatState.updateSession(false, 'choice', '');
    uiRegistry.renderAll();
  });
}

function tryClientReconnect(roomCode) {
  if (reconnectCount >= 5) {
    console.log('Max reconnect attempts reached. Giving up.');
    cleanupPeer();
    hideReconnectBanner();
    CombatState.updateSession(false, 'choice', '');
    uiRegistry.renderAll();
    showCustomAlert(
      'Verbindung unterbrochen',
      'Die Verbindung zum Spielleiter wurde endgültig unterbrochen.<br>Bitte überprüfe deinen Raum-Code und tritt neu bei.'
    );
    return;
  }

  reconnectCount++;
  console.log(`Reconnection attempt ${reconnectCount}/5 for room: ${roomCode}`);
  showReconnectBanner(reconnectCount);

  const hostId = `combatsheet-host-${roomCode}`;
  if (!peerInstance || peerInstance.destroyed) {
    try {
      const options = getPeerOptions();
      peerInstance = new Peer(options);
      peerInstance.on('open', () => {
        establishConnection(hostId, roomCode);
      });
      peerInstance.on('error', (err) => {
        console.error('Peer error during reconnect:', err);
        reconnectTimer = setTimeout(() => tryClientReconnect(roomCode), 3000);
      });
    } catch (e) {
      console.error('Failed to recreate peer during reconnect:', e);
      reconnectTimer = setTimeout(() => tryClientReconnect(roomCode), 3000);
    }
  } else {
    establishConnection(hostId, roomCode);
  }
}

function establishConnection(hostId, roomCode) {
  const conn = peerInstance.connect(hostId);
  
  const failTimeout = setTimeout(() => {
    console.log('Connection attempt timed out. Retrying...');
    conn.close();
  }, 4000);

  conn.on('open', () => {
    clearTimeout(failTimeout);
    console.log('Successfully connected to Host:', hostId);
    isReconnecting = false;
    reconnectCount = 0;
    hideReconnectBanner();

    const s = CombatState.getState();
    if (s.session) {
      s.session.connections = [conn];
    }
    
    // Handshake: Exchange protocol versions
    conn.send({ type: 'hello', version: SYNC_PROTOCOL_VERSION });

    // Request initial authoritative full sync state from host
    conn.send({ type: 'full_sync_request', peerId: peerInstance.id });

    // Send local PC state immediately to the host upon connection to register it
    const activePC = CombatState.getActivePC();
    if (activePC) {
      try {
        sendToHostDirect({
          type: 'update_pc',
          pc: activePC
        });
      } catch (e) {
        console.error('NetworkManager: Failed to send initial PC update:', e);
      }
    }

    // Activate pings
    connectionMonitor.start();

    // Flush any offline buffered packets
    clientQueue.flush();
    
    // Initialize diffing cache for PC changes
    initializeCaches();

    conn.on('data', data => {
      handleIncomingData(conn, data);
    });

    conn.on('close', () => {
      console.log('Connection to Host lost.');
      triggerReconnectSequence(roomCode);
    });

    conn.on('error', err => {
      console.error('Host connection error:', err);
      triggerReconnectSequence(roomCode);
    });
  });

  conn.on('error', err => {
    clearTimeout(failTimeout);
    console.error('Connection error during connect:', err);
    triggerReconnectSequence(roomCode);
  });
}

function triggerReconnectSequence(roomCode) {
  if (isReconnecting) return;
  isReconnecting = true;
  reconnectCount = 0;
  tryClientReconnect(roomCode);
}

export function initializeClientPeer(roomCode) {
  cleanupPeer();
  console.log('Initializing Client Peer with random ID');
  
  isReconnecting = false;
  reconnectCount = 0;
  hideReconnectBanner();

  const options = getPeerOptions();
  try {
    peerInstance = new Peer(options);
  } catch (e) {
    console.error('Failed to create Peer instance:', e);
    showCustomAlert('Verbindungsfehler', 'PeerJS konnte nicht initialisiert werden: ' + e.message);
    return;
  }

  peerInstance.on('open', id => {
    console.log('Client Peer successfully registered with ID:', id);
    const hostId = `combatsheet-host-${roomCode}`;
    establishConnection(hostId, roomCode);
  });

  peerInstance.on('error', err => {
    console.error('Client Peer error:', err);
    const s = CombatState.getState();
    if (s.session && s.session.active && s.session.role === 'client') {
      triggerReconnectSequence(roomCode);
    } else {
      showCustomAlert('Verbindungsfehler (Client)', err.message);
      cleanupPeer();
      CombatState.updateSession(false, 'choice', '');
      uiRegistry.renderAll();
    }
  });
}

// Bind to State Changed events on Host
CombatState.registerStateChangedCallback((state) => {
  if (state.session && state.session.role === 'host') {
    const diffPacket = getEncounterStateDiff();
    if (diffPacket) {
      hostQueue.enqueue(diffPacket);
    }
  }
});

// Bind to PC Sheet changes from Client
CombatState.registerPCChangedCallback((pc, options) => {
  const s = CombatState.getState();
  if (s.session && s.session.role === 'client') {
    if (options && options.forceFullSync) {
      clearCachedPCState();
    }
    const packet = getPCStateDiff();
    if (packet) {
      if (packet.type === 'update_pc') {
        // Send full registration/character switch packets immediately
        sendToHost(packet);
      } else {
        // Debounce PC diff packets by 250ms to compress rapid keystrokes/slider drag events
        clientQueue.enqueueDebounced('pc_diff', packet, 250);
      }
    }
  }
});

// Bind to session changed events
CombatState.registerSessionChangedCallback((active, role, roomCode) => {
  if (active) {
    if (role === 'host') {
      initializeHostPeer(roomCode);
    } else if (role === 'client') {
      initializeClientPeer(roomCode);
    }
  } else {
    cleanupPeer();
  }
});

export const NetworkManager = {
  initializeHostPeer,
  initializeClientPeer,
  cleanupPeer
};

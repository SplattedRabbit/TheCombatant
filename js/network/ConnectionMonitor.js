export class ConnectionMonitor {
  constructor(sendFn = null) {
    this.sendFn = sendFn;
    this.latency = 0;
    this.status = 'disconnected'; // 'connected' | 'degraded' | 'disconnected'
    this.interval = null;
  }

  setSendFunction(sendFn) {
    this.sendFn = sendFn;
  }

  start() {
    this.stop();
    this.status = 'connected';
    this.updateUI();

    this.interval = setInterval(() => {
      if (this.sendFn) {
        try {
          this.sendFn({ type: 'heartbeat_ping', timestamp: Date.now() });
        } catch (e) {
          console.error('ConnectionMonitor: Failed to send ping:', e);
          this.status = 'disconnected';
          this.updateUI();
        }
      }
    }, 5000);
  }

  onPong(packet) {
    this.latency = Date.now() - packet.timestamp;
    this.status = this.latency < 150 ? 'connected' : 'degraded';
    this.updateUI();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.status = 'disconnected';
    this.updateUI();
  }

  updateUI() {
    const dot = document.getElementById('connectionDot');
    if (dot) {
      dot.className = `conn-dot conn-${this.status}`;
      
      let label = 'Nicht verbunden';
      if (this.status === 'connected') {
        label = `Verbunden (${this.latency}ms)`;
      } else if (this.status === 'degraded') {
        label = `Hohe Latenz (${this.latency}ms)`;
      }
      
      dot.title = label;
    }
  }
}

// Singleton Connection Monitor
export const connectionMonitor = new ConnectionMonitor();

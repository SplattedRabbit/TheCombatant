export class MessageQueue {
  constructor(sendFn = null) {
    this.sendFn = sendFn;
    this.queue = [];
    this.debounceTimers = {};
    this.pendingPackets = {};
  }

  setSendFunction(sendFn) {
    this.sendFn = sendFn;
  }

  /**
   * Enqueue a packet to be sent. If offline or transport is down, buffers it.
   */
  enqueue(packet) {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (!isOnline || !this.sendFn) {
      console.warn('Network offline or transport not initialized. Buffering packet:', packet.type);
      this.queue.push(packet);
      return;
    }

    try {
      this.sendFn(packet);
    } catch (e) {
      console.error('MessageQueue: Failed to send packet, queueing for retry:', e);
      this.queue.push(packet);
    }
  }

  /**
   * Enqueue a packet with debouncing (e.g. for character name text inputs).
   */
  enqueueDebounced(key, packet, delayMs = 300) {
    if (this.debounceTimers[key]) {
      clearTimeout(this.debounceTimers[key]);
      if (key === 'pc_diff' && this.pendingPackets[key] && this.pendingPackets[key].diff && packet && packet.type === 'pc_diff') {
        // Merge flat path-based diffs to avoid losing rapid keystrokes/field updates
        Object.assign(this.pendingPackets[key].diff, packet.diff);
      } else {
        this.pendingPackets[key] = packet;
      }
    } else {
      this.pendingPackets[key] = packet;
    }

    this.debounceTimers[key] = setTimeout(() => {
      const pkt = this.pendingPackets[key];
      delete this.debounceTimers[key];
      delete this.pendingPackets[key];
      if (pkt) {
        this.enqueue(pkt);
      }
    }, delayMs);
  }

  /**
   * Flushes all buffered packets in the queue.
   */
  flush() {
    if (!this.sendFn || this.queue.length === 0) return;

    console.log(`MessageQueue: Flushing ${this.queue.length} buffered packets...`);
    const tempQueue = [...this.queue];
    this.queue = [];

    for (const packet of tempQueue) {
      try {
        this.sendFn(packet);
      } catch (e) {
        console.error('MessageQueue: Failed to flush packet, halting and re-queueing remaining:', e);
        // Prepend remaining unsent items back to the queue
        this.queue = [packet, ...tempQueue.slice(tempQueue.indexOf(packet) + 1)];
        break;
      }
    }
  }

  /**
   * Clears all items and timers
   */
  clear() {
    this.queue = [];
    for (const key in this.debounceTimers) {
      clearTimeout(this.debounceTimers[key]);
    }
    this.debounceTimers = {};
  }
}

// Singletons for Host and Client outgoing channels
export const hostQueue = new MessageQueue();
export const clientQueue = new MessageQueue();

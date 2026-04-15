/*
Toolbox Aid
David Quesenberry
03/22/2026
LoopbackTransport.js
*/
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export default class LoopbackTransport {
  constructor(id) {
    this.id = id;
    this.remote = null;
    this.connected = false;
    this.inbox = [];
  }

  connect(remote) {
    this.remote = remote;
    this.connected = true;
  }

  disconnect() {
    this.connected = false;
    this.remote = null;
  }

  receive(packet) {
    this.inbox.push(clone(packet));
  }

  send(packet) {
    if (!this.connected || !this.remote) {
      return false;
    }

    this.remote.receive(packet);
    return true;
  }

  drainInbox() {
    const drained = [...this.inbox];
    this.inbox.length = 0;
    return drained;
  }

  static createLinkedPair(hostId = 'host', clientId = 'client') {
    const host = new LoopbackTransport(hostId);
    const client = new LoopbackTransport(clientId);
    host.connect(client);
    client.connect(host);
    return [host, client];
  }
}

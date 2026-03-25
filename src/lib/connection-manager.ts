import { WebSocket } from 'ws';

class ConnectionManager {
  private connections = new Map<string, Set<WebSocket>>();

  add(userId: string, ws: WebSocket): void {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(ws);
  }

  remove(userId: string, ws: WebSocket): void {
    const sockets = this.connections.get(userId);
    if (!sockets) return;
    sockets.delete(ws);
    if (sockets.size === 0) {
      this.connections.delete(userId);
    }
  }

  getConnections(userId: string): Set<WebSocket> | undefined {
    return this.connections.get(userId);
  }

  isOnline(userId: string): boolean {
    return this.connections.has(userId);
  }

  /**
   * Envoie un payload JSON a une liste d'utilisateurs connectes.
   * Optionnellement exclut un userId (ex: le sender).
   */
  broadcastToUsers(userIds: string[], payload: object, excludeUserId?: string): void {
    const message = JSON.stringify(payload);
    for (const userId of userIds) {
      if (userId === excludeUserId) continue;
      const sockets = this.connections.get(userId);
      if (!sockets) continue;
      for (const ws of sockets) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      }
    }
  }

  getOnlineUserIds(): string[] {
    return Array.from(this.connections.keys());
  }
}

export default ConnectionManager;

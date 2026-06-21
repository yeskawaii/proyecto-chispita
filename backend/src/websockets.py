from fastapi import WebSocket
from typing import Dict

class ConnectionManager:
    def __init__(self):
        # Mapea un nombre de usuario a su conexión WebSocket
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, usuario: str):
        await websocket.accept()
        self.active_connections[usuario] = websocket

    def disconnect(self, usuario: str):
        if usuario in self.active_connections:
            del self.active_connections[usuario]

    async def send_personal_message(self, message: str, usuario: str):
        if usuario in self.active_connections:
            await self.active_connections[usuario].send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

manager = ConnectionManager()

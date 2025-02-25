import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer

class OnlineStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            self.group_name = f"user_status_{self.user.username}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            await self.broadcast_status("online")

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.broadcast_status("offline")
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def broadcast_status(self, status):
        """Notify friends that this user is online/offline."""
        await self.channel_layer.group_send(
            f"user_friends_{self.user.username}",
            {
                "type": "status_update",
                "user": self.user.username,
                "status": status,
            },
        )

    async def status_update(self, event):
        """Send status update to frontend."""
        await self.send(text_data=json.dumps(event))
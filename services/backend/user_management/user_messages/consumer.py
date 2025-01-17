import json
import asyncio
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

class chatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
       self.username = self.scope["url_route"]["kwargs"]["username"]
       await self.accept()

       await self.send(text_data=json.dumps({"message": self.username}))

    async def disconnect(self, close_code):
       pass
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        await self.send(text_data=json.dumps({"message": message}))

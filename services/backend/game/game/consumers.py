
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class Consumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		await self.send(text_data=json.dumps({
			"message": 'Welcome to the Websocket'
		}))
	async def disconnect(self, close_code):
		pass
	async def receive(self, text_data):
		data = json.loads(text_data)
		await self.send(text_data=json.dumps({
			'message': data['message']
		}))


import json
from channels.generic.websocket import AsyncWebsocketConsumer

class Consumer(AsyncWebsocketConsumer):
	clients = set()

	async def connect(self):
		message = "Welcome to the Websocket!"
		await self.accept()
		if len(self.clients) < 2:
			self.clients.add(self)
		else :
			message = "Full Lobby!"
			self.clients.disconnect()

		await self.send(text_data=json.dumps({
			"message": message
		}))
	
	async def disconnect(self, close_code):
		self.clients.remove(self)

	async def receive(self, text_data):
		data = json.loads(text_data)
		message = data.get('message')

		for client in self.clients:
			await client.send(text_data=json.dumps({
				'message': message
			}))

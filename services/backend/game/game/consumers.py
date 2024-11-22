
import json
from channels.generic.websocket import AsyncWebsocketConsumer

lobbies = {}

class Consumer(AsyncWebsocketConsumer):

	async def connect(self):
		self.lobby_id = self.scope["url_route"]["kwargs"]["lobby_id"]
		self.user_id = self.channel_name

		if self.lobby_id not in lobbies:
			lobbies[self.lobby_id] = []

		if len(lobbies[self.lobby_id]) < 2:
			lobbies[self.lobby_id].append(self.user_id)
			await self.channel_layer.group_add(
				self.lobby_id,
				self.channel_name
			)
			await self.accept()
		else:
			await self.close()

	async def disconnect(self, close_code):
		if self.lobby_id in lobbies and self.user_id in lobbies[self.lobby_id]:
			lobbies[self.lobby_id].remove(self.user_id)
			if not lobbies[self.lobby_id]:
				del lobbies[self.lobby_id]
			await self.channel_layer.group_discard(
				self.lobby_id,
				self.channel_name
			)
		
	async def receive(self, text_data):
		data = json.loads(text_data)
		send_type = data.get('type')
		payload = data.get('payload')

		if 'type' in data and 'payload' in data:
			self.groupSend(send_type, payload)
		else:
			await self.send(json.dumps({
				'error': 'Type and Payload are required!'
			}))

	async def groupSend(self, send_type, payload):
		await self.channel_layer.group_send(
				self.lobby_id,
				{
					'type': 'sendLobby',
					'send_type': send_type,
					'payload': payload
				}
			)

	async def sendLobby(self, event):
		await self.send(json.dumps({
			'type': event['send_type'],
			'payload': event['payload']
		}))
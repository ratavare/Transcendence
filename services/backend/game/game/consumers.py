
import json
from channels.generic.websocket import AsyncWebsocketConsumer

lobbies = {}

class Consumer(AsyncWebsocketConsumer):

	async def connect(self):
		self.lobby_id = self.scope["url_route"]["kwargs"]["lobby_id"]
		self.user_id = self.channel_name

		if self.lobby_id not in lobbies:
			lobbies[self.lobby_id] = set()

		if len(lobbies[self.lobby_id]) >= 2:
			await self.sendMessage('message','Connection Rejected')
			await self.close()
			return

		lobbies[self.lobby_id].add(self.user_id)
		await self.channel_layer.group_add(self.lobby_id, self.channel_name)
		await self.accept()
		await self.sendMessage('message','Connection Accepted')

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
		try:
			data = json.loads(text_data)
			send_type = data.get('type')
			payload = data.get('payload')
			await self.groupSend(send_type, payload)
		except:
			await self.sendMessage('message', 'Type and Payload keys are required!')

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
		await self.sendMessage(event['send_type'], event['payload'])

	async def sendMessage(self, send_type, payload):
		await self.send(text_data=json.dumps({'type': send_type, 'payload': payload}))
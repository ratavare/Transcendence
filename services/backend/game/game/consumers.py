
import json
import datetime
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer

lobbies = {}
PADDLE_SPEED = 15;
AIPADDLE_SPEED = 15;
BALL_INITIAL_SPEED = -15;
SHAKE_INTENSITY = 10;
SHAKE_DURATION = 10;
PADDLE_COLOR = 0x008000;
TABLE_COLOR = 0x800080;
PLANE_COLOR = 0x000000;
BALL_COLOR = 0x00ff00;
POINT_LIGHT_INTENSITY = 1000000;
POINT_LIGHT_DISTANCE = 1000;
AMBIENT_LIGHT_INTENSITY = 3;

def myPrint(p):
	print(p, flush=True)
	

class Paddle():
	def __init__(self):
		self.speed = 0
		self.positionX = -800
		self.positionZ = -50
		self.paddleBindingBox = {}
		self.width = 10
		self.length = 100
		self.depth = 0

class Ball:
	def __init__(self):
		self.diameter = 10
		self.speedX = BALL_INITIAL_SPEED
		self.speedZ = 0
		self.positionX = 200
		self.positionZ = 0
		self.ballBindingBox = {}

class Pong:
	def __init__(self):
		self.player1Score = 0;
		self.player2Score = 0;

		self.ball = Ball()
		self.paddle1 = Paddle()
		self.paddle2 = Paddle()
	
		self.shakeDuration = 0;
		self.gamePaused = False;
		self.beginGame = False;
		self.startTime = datetime.datetime.now()

	async def update_state(self):
		await self.checkIntersection()
		self.ball.positionX += self.ball.speedX
		self.ball.positionZ += self.ball.speedZ
		self.paddle1.positionZ += self.paddle1.speed

		self.ball.ballBindingBox = {
			'min': [(self.ball.positionX - self.ball.diameter) / 2, (self.ball.positionZ - self.ball.diameter) / 2, 0],
			'max': [(self.ball.positionX + self.ball.diameter) / 2, (self.ball.positionZ + self.ball.diameter) / 2, 0],
		}
	
	async def checkIntersection(self):
		myPrint(f"Ball: {self.ball.ballBindingBox}, Paddle: {self.paddle1.paddleBindingBox}")
		intersect = self.intersections(self.ball.ballBindingBox, self.paddle1.paddleBindingBox)
		if intersect:
			self.ball.speedX *= -1
			self.increaseSpeed()
			self.adjustDirections()
			self.ball.positionX += self.ball.speedX
			self.ball.positionZ += self.ball.speedZ

	def intersections(self, ball, paddle):
		return	paddle['max'][0] >= ball['min'][0] and paddle['min'][0] <= ball['max'][0] and \
				paddle['max'][1] >= ball['min'][1] and paddle['min'][1] <= ball['max'][1] and \
				paddle['max'][2] >= ball['min'][2] and paddle['min'][2] <= ball['max'][2]

	def adjustDirections(self):
		realtiveIntersectZ = self.paddle1.positionZ + (self.paddle1.depth / 2) - self.ball.positionZ
		normalizedIntersectZ = (realtiveIntersectZ / (self.paddle1.depth / 2)) - 1
		self.ball.speedZ = normalizedIntersectZ * 20

	def increaseSpeed(self):
		if self.ball.speedX < 20 and self.ball.speedX > -20:
			self.ball.speedX += 0.4 if self.ball.speedX > 0 else -0.4
	
class Consumer(AsyncWebsocketConsumer):

	async def connect(self):
		self.game = Pong()
		self.paddle1 = Paddle()
		self.paddle2 = Paddle()
		self.lobby_id = self.scope["url_route"]["kwargs"]["lobby_id"]
		self.user_id = self.channel_name

		if self.lobby_id not in lobbies:
			lobbies[self.lobby_id] = set()

		if len(lobbies[self.lobby_id]) >= 2:
			await self.sendMessage('message','Connection Rejected: Lobby is full!')
			await self.close()
			return

		lobbies[self.lobby_id].add(self.user_id)
		await self.channel_layer.group_add(self.lobby_id, self.channel_name)
		self.game_loop = None
		await self.accept()
		await self.sendMessage('message','Connection Accepted: Welcome!')


	async def disconnect(self, close_code):
		if self.game_loop:
			self.game_loop.cancel()
			try:
				await self.game_loop
			except asyncio.CancelledError:
				pass

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

			if send_type == 'componentsInit':
				self.game.ball.ballBindingBox = payload['ball']
				self.game.paddle1.paddleBindingBox = payload['paddle']
				self.game.paddle1.depth = payload['depth']
			
			if send_type == 'move':
				self.game.paddle1.speed = payload['speed']
				self.game.paddle1.paddleBindingBox = {
					'min': [-800, 0, self.game.paddle1.positionZ - self.game.paddle1.width / 2],
					'max': [-790, 30, self.game.paddle1.positionZ + self.game.paddle1.width / 2]
				}

			if send_type == 'beginGame':
				self.game_loop = asyncio.create_task(self.runLoop())

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

	async def runLoop(self):
		try:
			while True:
				await self.game.update_state()
				await self.sendState()
				await asyncio.sleep(0.016)
		except asyncio.CancelledError:
			await self.sendMessage('message', 'Game End')

	async def sendState(self):
		payload = {
			"ballSpeedX": self.game.ball.speedX,
			"ballSpeedZ": self.game.ball.speedZ,
			"paddle1Speed": self.game.paddle1.speed,
		}
		await self.groupSend("state", payload)

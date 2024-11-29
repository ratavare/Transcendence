
import json
import datetime
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer

lobbies = {}
PADDLE_SPEED = 15;
AIPADDLE_SPEED = 15;
BALL_INITIAL_SPEED = 15;
SHAKE_INTENSITY = 10;
SHAKE_DURATION = 10;
PADDLE_COLOR = 0x008000;
TABLE_COLOR = 0x800080;
PLANE_COLOR = 0x000000;
BALL_COLOR = 0x00ff00;
POINT_LIGHT_INTENSITY = 1000000;
POINT_LIGHT_DISTANCE = 1000;
AMBIENT_LIGHT_INTENSITY = 3;

class Paddle():
	def __init__(self):
		self.speed = 0
		self.positionZ = 0
		self.paddleBindingBox = []

class Ball:
	def __init__(self):
		self.speedX = BALL_INITIAL_SPEED
		self.speedZ = 0
		self.rotationX = 0
		self.rotationY = 0
		self.positionX = 200
		self.positionZ = 0
		self.ballBindingBox = []

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

	def update_state(self):
		# await self.checkIntersection()
		self.ball.rotationX += 0.01
		self.ball.rotationX += 0.01
		self.ball.positionX += self.ball.speedX
		self.ball.positionZ += self.ball.speedZ
	
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
			await self.sendMessage('message', send_type + "123")

			# if send_type == 'componentsInit':
			# 	self.game.ball.ballBindingBox = payload['ball']
			# 	self.game.paddle1.paddleBindingBox = payload['paddle']
	
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
				self.game.update_state()
				await self.sendState()
				await asyncio.sleep(1)
		except asyncio.CancelledError:
			await self.sendMessage('message', 'Game End')

	async def sendState(self):
		payload = {
			"ballSpeedX": self.game.ball.speedX,
			"ballSpeedZ": self.game.ball.speedZ,
			"ballRotationX": self.game.ball.rotationX,
			"ballRotationY": self.game.ball.rotationY,
		}
		await self.groupSend("state", payload)

# 	async def checkIntersection(self):
# 		if intersections(self.game.ball.paddleBindingBox, self.game.paddle1.paddleBindingBox):
# 			self.game.ball.speedX *= -1;
# 			await self.increaseSpeed();

# 	async def increaseSpeed(self):
# 		if self.game.ball.speedX < 20 and self.game.ball.speedX > -20:
# 			self.game.ball.speedX += 0.4 if self.game.ball.speedX > 0 else -0.4

# def intersections(ball, paddle):
# 	return ball.max.x >= paddle.min.x and ball.min.x <= paddle.max.x and \
# 		ball.max.y >= paddle.min.y and ball.min.y <= paddle.max.y and \
# 		ball.max.z >= paddle.min.z and ball.min.z <= paddle.max.z


import json
import datetime
import asyncio
from lobby.models import Lobby
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

lobbies = {}
PADDLE_SPEED = 20
AIPADDLE_SPEED = 15
BALL_INITIAL_SPEED = 10
BALL_DIAMETER = 10
BALL_RADIUS = BALL_DIAMETER / 2
BOUNDARIES_WIDTH = 2700
BOUNDARIES_HEIGHT = 100
BOUNDARIES_DEPTH = 100
FLOOR_POSITION_X = -1300
FLOOR_POSITION_Y = -50
FLOOR_POSITION_Z = 500
CEILING_POSITION_X = -1300
CEILING_POSITION_Y = -50
CEILING_POSITION_Z = -600
PADDLE1_POSITION_X = -810
PADDLE1_POSITION_Z = 0
PADDLE2_POSITION_X = 800
PADDLE2_POSITION_Z = 0
PADDLE_POSITION_Y = -15
PADDLE_WIDTH = 10
PADDLE_LENGTH = 100
PADDLE_DEPTH = 30


def myPrint(p):
	print(p, flush=True)
	

class Paddle():
	def __init__(self, positionX=0, positionZ=0):
		self.moving = 0
		self.speed = 0
		self.boundingBox = {}
		self.width = PADDLE_WIDTH
		self.length = PADDLE_LENGTH
		self.depth = PADDLE_DEPTH
		self.positionZ = positionZ
		self.positionX = positionX
		self.positionY = PADDLE_POSITION_Y

class Ball:
	def __init__(self):
		self.radius = BALL_RADIUS
		self.diameter = BALL_DIAMETER
		self.speedX = BALL_INITIAL_SPEED
		self.speedZ = 0
		self.positionX = 0
		self.positionZ = 0

class Pong:
	def __init__(self):
		self.player1Score = 0;
		self.player2Score = 0;

		self.ball = Ball()
		self.paddle1 = Paddle(positionX=PADDLE1_POSITION_X, positionZ=PADDLE1_POSITION_Z)
		self.paddle2 = Paddle(positionX=PADDLE2_POSITION_X, positionZ=PADDLE2_POSITION_Z)
	
		self.gamePaused = False;
		self.beginGame = False;
		self.startTime = datetime.datetime.now()

	def respawnBall(self, playerId):
		if playerId == 1:
			self.ball.positionX = 200
			self.ball.positionZ = 0
			self.ball.speedX = BALL_INITIAL_SPEED
			self.ball.speedZ = 0
			self.beginGame = False
		else:
			self.ball.positionX = -200
			self.ball.positionZ = 0
			self.ball.speedX = -BALL_INITIAL_SPEED
			self.ball.speedZ = 0
			self.beginGame = False

	def outOfBounds(self):
		if self.ball.positionX > 1000:
			myPrint("Player 1 Scored")
			self.player1Score += 1
			self.respawnBall(1)
			return 2
		elif self.ball.positionX < -1000:
			myPrint("Player 2 Scored")
			self.player2Score += 1
			self.respawnBall(2)
			return 2
		return 0

	def move(self):
		self.ball.positionX += self.ball.speedX
		self.ball.positionZ += self.ball.speedZ
		return self.outOfBounds()

	def movePaddle(self):
		if self.paddle1.moving == 1:
			self.paddle1.speed = PADDLE_SPEED
		elif self.paddle1.moving == -1:
			self.paddle1.speed = -PADDLE_SPEED
		else:
			self.paddle1.speed = 0

		if self.paddle2.moving == 1:
			self.paddle2.speed = PADDLE_SPEED
		elif self.paddle2.moving == -1:
			self.paddle2.speed = -PADDLE_SPEED
		else:
			self.paddle2.speed = 0
		self.paddle1.positionZ += self.paddle1.speed
		self.paddle2.positionZ += self.paddle2.speed

	def update_state(self):
		if self.player1Score == 7 or self.player2Score == 7:
			return 3
		self.movePaddle()
		action = self.checkIntersection()
		point = self.move()
		if point == 2:
			return point
		return action

	def checkIntersection(self):
		ballBox = {
			'min': [self.ball.positionX - BALL_RADIUS, self.ball.positionZ - BALL_RADIUS],
			'max': [self.ball.positionX + BALL_RADIUS, self.ball.positionZ + BALL_RADIUS],
		}
	
		# Define the bounding box for paddle1
		paddle1Box = {
			'min': [self.paddle1.positionX, self.paddle1.positionZ - self.paddle1.length / 2],
			'max': [self.paddle1.positionX + self.paddle1.width, self.paddle1.positionZ + self.paddle1.length / 2],
		}
	
		# Define the bounding box for paddle2
		paddle2Box = {
			'min': [self.paddle2.positionX, self.paddle2.positionZ - self.paddle2.length],
			'max': [self.paddle2.positionX + self.paddle2.width, self.paddle2.positionZ + self.paddle2.length / 2],
		}
	
		# Intersection with top and bottom boundaries
		if ballBox['max'][1] >= FLOOR_POSITION_Z or ballBox['min'][1] <= CEILING_POSITION_Z + 100:
			self.ball.speedZ *= -1
			self.ball.positionX += self.ball.speedX
			self.ball.positionZ += self.ball.speedZ

		if self.paddle1.positionZ > 450:
			self.paddle1.positionZ = 450
		elif self.paddle1.positionZ < -450:
			self.paddle1.positionZ = -450

		if self.paddle2.positionZ > 450:
			self.paddle2.positionZ = 450
		elif self.paddle2.positionZ < -450:
			self.paddle2.positionZ = -450
	
		# Check for intersection with paddle1
		if (ballBox['max'][0] >= paddle1Box['min'][0] and ballBox['min'][0] <= paddle1Box['max'][0] and
			ballBox['max'][1] >= paddle1Box['min'][1] and ballBox['min'][1] <= paddle1Box['max'][1]):
			self.ball.speedX *= -1
			self.increaseSpeed()
			self.adjustDirections(1)
			self.ball.positionX += self.ball.speedX
			self.ball.positionZ += self.ball.speedZ
			return 1

	
		# Check for intersection with paddle2
		if (ballBox['max'][0] >= paddle2Box['min'][0] and ballBox['min'][0] <= paddle2Box['max'][0] and
			ballBox['max'][1] >= paddle2Box['min'][1] and ballBox['min'][1] <= paddle2Box['max'][1]):
			self.ball.speedX *= -1
			self.increaseSpeed()
			self.adjustDirections(2)
			self.ball.positionX += self.ball.speedX
			self.ball.positionZ += self.ball.speedZ
			return 1
		return 0		

	def adjustDirections(self, paddle):
		if paddle == 1:
			realtiveIntersectZ = self.paddle1.positionZ + (self.paddle1.depth / 2) - self.ball.positionZ
			normalizedIntersectZ = (realtiveIntersectZ / (self.paddle1.depth / 2)) - 1
			self.ball.speedZ = normalizedIntersectZ * 4
		else:
			realtiveIntersectZ = self.paddle2.positionZ + (self.paddle2.depth / 2) - self.ball.positionZ
			normalizedIntersectZ = (realtiveIntersectZ / (self.paddle2.depth / 2)) - 1
			self.ball.speedZ = normalizedIntersectZ * 4

	def increaseSpeed(self):
		if self.ball.speedX < 20 and self.ball.speedX > -20:
			self.ball.speedX += 0.4 if self.ball.speedX > 0 else -0.4
	
class Consumer(AsyncWebsocketConsumer):

	async def connect(self):
		self.game = Pong()
		self.lobby_id = self.scope["url_route"]["kwargs"]["lobby_id"]
		self.user_id = self.channel_name

		# Create lobby
		if self.lobby_id not in lobbies:
			lobbies[self.lobby_id] = set()

		# if len(lobbies[self.lobby_id]) >= 2:
		# 	await self.sendMessage('message','Connection Rejected: Lobby is full!')
		# 	await self.close()
		# 	return

		lobbies[self.lobby_id].add(self.user_id)
		await self.channel_layer.group_add(self.lobby_id, self.channel_name)
		
		self.game_loop = None
	
		await self.accept()
		await self.playerId(self.lobby_id, self.user_id)
		await self.graphicsInit()
		if len(lobbies[self.lobby_id]) < 2:
			await self.sendMessage('message', f'Connection Accepted: Welcome {self.user_id}!')

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
			else:
				await self.groupSend('message', f'{self.user_id} left the lobby')
			await self.channel_layer.group_discard(
				self.lobby_id,
				self.channel_name
			)
		
	async def receive(self, text_data):
		try:
			data = json.loads(text_data)
			send_type = data.get('type')
			payload = data.get('payload')

			match(send_type):
				case 'p1':
					self.game.paddle1.moving = payload['direction']
				case 'p2':
					self.game.paddle2.moving = payload['direction']
				case 'beginGame':
					self.game_loop = asyncio.create_task(self.runLoop())
				case 'pause':
					if self.game.gamePaused == False:
						self.game.gamePaused = True
					else:
						self.game.gamePaused = False

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
				if self.game.gamePaused == True:
					await asyncio.sleep(0.016)
					continue

				action = self.game.update_state()
				if action == 1:
					await self.groupSend("shake", {})
				elif action == 2:
					await self.groupSend("point", payload={"player1Score": self.game.player1Score, "player2Score": self.game.player2Score})
				await self.sendState()
				await asyncio.sleep(0.016)
				if action == 3:
					break
		except asyncio.CancelledError:
			await self.sendMessage('message', 'Game End')

	async def sendState(self):
		payload = {
			"ballPositionX" : self.game.ball.positionX,
			"ballPositionZ" : self.game.ball.positionZ,
			"paddle1PositionZ": self.game.paddle1.positionZ,
			"paddle2PositionZ": self.game.paddle2.positionZ,
		}
		await self.groupSend("state", payload)

	async def graphicsInit(self):
		payload = {
			"ballRadius": BALL_RADIUS,
			"boundariesWidth": BOUNDARIES_WIDTH,
			"boundariesHeight": BOUNDARIES_HEIGHT,
			"boundariesDepth": BOUNDARIES_DEPTH,
			"floorPositionX": FLOOR_POSITION_X,
			"floorPositionY": FLOOR_POSITION_Y,
			"floorPositionZ": FLOOR_POSITION_Z,
			"ceilingPositionX": CEILING_POSITION_X,
			"ceilingPositionY": CEILING_POSITION_Y,
			"ceilingPositionZ": CEILING_POSITION_Z,
			"paddle1PositionX": PADDLE1_POSITION_X,
			"paddle1PositionZ": PADDLE1_POSITION_Z - 50,
			"paddle2PositionX": PADDLE2_POSITION_X,
			"paddlePositionY": PADDLE_POSITION_Y,
			"paddle2PositionZ": PADDLE2_POSITION_Z - 50,
			"paddleWidth": PADDLE_WIDTH,
			"paddleLength": PADDLE_LENGTH,
			"paddleDepth": PADDLE_DEPTH,
		}
		await self.sendMessage("graphicsInit", payload)


	# player is self.user_id which is ecrypted/binary shit...
	# TO.DO change this to search in consumers lobby
	async def playerId(self, lobby_id, player):
		lobby = await database_sync_to_async(Lobby.objects.get)(lobby_id=lobby_id)
		userExists = await database_sync_to_async(lobby.users.filter(username=player).exists)()
		if userExists:
			usersInLobby = await database_sync_to_async(list)(lobby.users.all())
			if usersInLobby[0].username == player:
				await self.groupSend('paddleInit', { player: 1 })
			elif len(usersInLobby) > 1 and usersInLobby[1].username == player:
				await self.groupSend('paddleInit', { player: 2 })
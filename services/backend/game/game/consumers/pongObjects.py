import datetime

class vars():
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
	POINTS_TO_WIN = 7

class Paddle():
	def __init__(self, positionX=0, positionZ=0):
		self.moving = 0
		self.speed = 0
		self.boundingBox = {}
		self.width = vars.PADDLE_WIDTH
		self.length = vars.PADDLE_LENGTH
		self.depth = vars.PADDLE_DEPTH
		self.positionZ = positionZ
		self.positionX = positionX
		self.positionY = vars.PADDLE_POSITION_Y

class Ball:
	def __init__(self):
		self.radius = vars.BALL_RADIUS
		self.diameter = vars.BALL_DIAMETER
		self.speedX = vars.BALL_INITIAL_SPEED
		self.speedZ = 0
		self.positionX = 0
		self.positionZ = 0

class Pong:
	def __init__(self):
		self.player1Score = 0
		self.player2Score = 0
		self.running = False

		self.player1Token = None
		self.player2Token = None

		self.ball = Ball()
		self.paddle1 = Paddle(positionX=vars.PADDLE1_POSITION_X, positionZ=vars.PADDLE1_POSITION_Z)
		self.paddle2 = Paddle(positionX=vars.PADDLE2_POSITION_X, positionZ=vars.PADDLE2_POSITION_Z)
	
		self.gamePaused = False
		self.startTime = datetime.datetime.now()

	def respawnBall(self, playerId):
		if playerId == 1:
			self.ball.positionX = 200
			self.ball.positionZ = 0
			self.ball.speedX = vars.BALL_INITIAL_SPEED
			self.ball.speedZ = 0
			self.beginGame = False
		else:
			self.ball.positionX = -200
			self.ball.positionZ = 0
			self.ball.speedX = -vars.BALL_INITIAL_SPEED
			self.ball.speedZ = 0
			self.beginGame = False

	def outOfBounds(self):
		if self.ball.positionX > 1000:
			self.player1Score += 1
			self.respawnBall(1)
			return 2
		elif self.ball.positionX < -1000:
			self.player2Score += 1
			self.respawnBall(2)
			return 2
		return 0
	
	def winCheck(self):
		if self.player1Score == vars.POINTS_TO_WIN:
			return self.player1Token
		if self.player2Score == vars.POINTS_TO_WIN:
			return self.player1Token
		return 0

	def move(self):
		self.ball.positionX += self.ball.speedX
		self.ball.positionZ += self.ball.speedZ
		return self.outOfBounds()

	def movePaddle(self):
		if self.paddle1.moving == 1:
			self.paddle1.speed = vars.PADDLE_SPEED
		elif self.paddle1.moving == -1:
			self.paddle1.speed = -vars.PADDLE_SPEED
		else:
			self.paddle1.speed = 0

		if self.paddle2.moving == 1:
			self.paddle2.speed = vars.PADDLE_SPEED
		elif self.paddle2.moving == -1:
			self.paddle2.speed = -vars.PADDLE_SPEED
		else:
			self.paddle2.speed = 0
		self.paddle1.positionZ += self.paddle1.speed
		self.paddle2.positionZ += self.paddle2.speed

	# return None if x is None else something_else
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
			'min': [self.ball.positionX - vars.BALL_RADIUS, self.ball.positionZ - vars.BALL_RADIUS],
			'max': [self.ball.positionX + vars.BALL_RADIUS, self.ball.positionZ + vars.BALL_RADIUS],
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
		if ballBox['max'][1] >= vars.FLOOR_POSITION_Z or ballBox['min'][1] <= vars.CEILING_POSITION_Z + 100:
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
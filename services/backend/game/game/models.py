
from django.db import models

def getBallInitialSpeed():
	return GameConstants.objects.get(key="CUBE_INITIAL_SPEED").value

class GameConstants(models.Model):
	key = models.CharField(unique=True)
	value = models.JSONField()

class GameState(models.Model):
	gameId = models.IntegerField(unique=True)
	player1Score = models.IntegerField(default=0)
	player2Score = models.IntegerField(default=0)
	cubeSpeedx = models.FloatField(default=getBallInitialSpeed)
	cubeSpeedz = models.FloatField(default=0)
	shakeDuration = models.IntegerField(default=0)
	paddle1Speed = models.IntegerField(default=0)
	paddle2Speed = models.IntegerField(default=0)
	gamePaused = models.BooleanField(default=False)
	beginGame = models.BooleanField(default=False)
	sphereData = models.JSONField()
	startTime = models.DateTimeField(auto_now_add=True)

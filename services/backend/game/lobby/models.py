from django.db import models
from django.contrib.auth.models import User


STATE_CHOICES = [
	('running', 'Running'),
	('closed', 'Closed'),
	('paused', 'Paused'),
]

class Position(models.Model):
	x = models.IntegerField(default=0)
	z = models.IntegerField(default=0)

class Lobby(models.Model):
	lobby_id = models.CharField(max_length=25, unique=True)
	created_at = models.DateTimeField(auto_now_add=True)
	users = models.ManyToManyField(User)
	gameState = models.CharField(choices=STATE_CHOICES, default="closed")
	player1Score = models.PositiveIntegerField(default=0)
	player2Score = models.PositiveIntegerField(default=0)
	ballPosition = models.ForeignKey(Position, related_name="BallPosition", on_delete=models.CASCADE, default=1)
	paddle1Position = models.ForeignKey(Position, related_name="Paddle1Position", on_delete=models.CASCADE, default=1)
	paddle2Position = models.ForeignKey(Position, related_name="Paddle2Position", on_delete=models.CASCADE, default=1)

from django.db import models
from django.contrib.auth.models import User


STATE_CHOICES = [
	('running', 'Running'),
	('closed', 'Closed'),
	('paused', 'Paused'),
]

class Position(models.Model):
	x = models.IntegerField()
	y = models.IntegerField()
	z = models.IntegerField()

class Lobby(models.Model):
	lobby_id = models.CharField(max_length=25, unique=True)
	created_at = models.DateTimeField(auto_now_add=True)
	users = models.ManyToManyField(User)
	gameState = models.CharField(choices=STATE_CHOICES, default="closed")
	player1Score = models.PositiveIntegerField()
	player2Score = models.PositiveIntegerField()
	ballPosition = models.ForeignKey(Position)
	paddle1Position = models.ForeignKey(Position)
	paddle2Position = models.ForeignKey(Position)

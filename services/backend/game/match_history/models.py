from django.db import models
from django.contrib.auth.models import User

class MatchHistory(models.Model):
	game_id = models.CharField(max_length=25, unique=True, blank=True)
	users = models.ManyToManyField(User)
	winner = models.CharField()
	player1Score = models.PositiveIntegerField(default=0)
	player2Score = models.PositiveIntegerField(default=0)
	date = models.DateTimeField(auto_now_add=True)
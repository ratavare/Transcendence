from django.db import models
from django.contrib.auth.models import User
from lobby.models import Lobby

class Tournament(models.Model):
	tournament_id = models.CharField(max_length=25, unique=True)
	players = models.ManyToManyField(User)
	lobbies = models.ForeignKey(Lobby, on_delete=models.CASCADE, related_name="TournamentGame", null=True, blank=True)
	winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="TournamentWinner", null=True, blank=True)
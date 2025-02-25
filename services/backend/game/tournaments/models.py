from django.db import models
from django.contrib.auth.models import User
from lobby.models import Lobby

class Tournament(models.Model):
	players = models.ManyToManyField(User)
	tournament_id = models.CharField(max_length=25, blank=True)
	lobbies = models.ManyToManyField(Lobby)
	
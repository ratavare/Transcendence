from django.db import models
from django.contrib.auth.models import User

class Lobby(models.Model):
	lobby_id = models.CharField(max_length=25, unique=True)
	created_at = models.DateTimeField(auto_now_add=True)
	users = models.ManyToManyField(User)

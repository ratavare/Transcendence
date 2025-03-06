from django.db import models
from django.contrib.auth.models import User

class GameHistory(models.Model):
    users = models.ManyToManyField(User)
    player1Score = models.PositiveIntegerField()
    player2Score = models.PositiveIntegerField()
    date = models.DateTimeField(auto_now_add=True)

# Fazer consumer dar update a esta xota
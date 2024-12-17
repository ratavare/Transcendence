from django.db import models
from django.contrib.auth.models import User

from django.db.models.signals import post_save
from django.dispatch import receiver

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
	player1Ready = models.BooleanField(default=False)
	player2Ready = models.BooleanField(default=False)
	ballPosition = models.ForeignKey(Position, related_name="BallPosition", on_delete=models.CASCADE, null=True, blank=True)
	paddle1Position = models.ForeignKey(Position, related_name="Paddle1Position", on_delete=models.CASCADE, null=True, blank=True)
	paddle2Position = models.ForeignKey(Position, related_name="Paddle2Position", on_delete=models.CASCADE, null=True, blank=True)

# signals to initialize positions when Lobby is created
@receiver(post_save, sender=Lobby)
def init_positions(sender, instance, created, **kwargs):
	if created:
		ball_position = Position.objects.create()
		paddle1_position = Position.objects.create()
		paddle2_position = Position.objects.create()

		Lobby.objects.filter(id=instance.id).update(
			ballPosition=ball_position,
			paddle1Position=paddle1_position,
			paddle2Position=paddle2_position
		)

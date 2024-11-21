
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import GameConstants

CONSTANTS = {
	"PADDLE_SPEED": 15,
	"AIPADDLE_SPEED": 15,
	"CUBE_INITIAL_SPEED": 15,
	"SHAKE_INTENSITY": 10,
	"SHAKE_DURATION": 10,
	"PADDLE_COLOR": 0x008000,
	"TABLE_COLOR": 0x800080,
	"PLANE_COLOR": 0x000000,
	"CUBE_COLOR": 0x00ff00,
	"POINT_LIGHT_INTENSITY": 1000000,
	"POINT_LIGHT_DISTANCE": 1000,
	"AMBIENT_LIGHT_INTENSITY": 3,
}

@receiver(post_migrate)
def gameConstantsInit(sender, **kwargs):
	for key, value in CONSTANTS.items():
		GameConstants.objects.update_or_create(key=key, defaults={"value": value})
from django.contrib.auth.models import User
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.timezone import now
import datetime

class Profile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
	full_name = models.TextField(blank=True, null=True)
	bio = models.TextField(blank=True, null=True)
	city = models.TextField(blank=True, null=True)
	birth_date = models.DateField(blank=True, null=True, validators=[MinValueValidator(datetime.date(1908, 1, 1)),MaxValueValidator(now().date())])
	otp_secret = models.TextField(blank=True, null=True)
	profile_picture = models.BinaryField(blank=True, null=True)
	intra_login = models.BooleanField(blank=True, null=True)
	wins = models.IntegerField(default=0)
	losses = models.IntegerField(default=0)

	def __str__(self):
		return f"{self.user.username}'s Profile"
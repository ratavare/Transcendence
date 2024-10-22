from django.contrib.auth.models import User
from django.db import models

class Profile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
	bio = models.TextField(blank=True, null=True)
	email = models.EmailField(blank=True, null=True)
	birth_date = models.DateField(blank=True, null=True)

	def __str__(self):
		return f"{self.user.username}'s Profile"
from django.contrib.auth.models import User
from django.db import models
from datetime import datetime

STATUS_CHOICES = (
	('requested', 'Firend Requests'),
	('accepted', 'Friend Requests Accepted'),
	('rejected', 'Friend Requests Rejected')
)

class Profile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
	bio = models.TextField(blank=True, null=True)
	birth_date = models.DateField(blank=True, null=True)

	def __str__(self):
		return f"{self.user.username}'s Profile"
	
class Friendships(models.Model):
	from_user = models.ForeignKey(User, related_name="friend_resquest_sent", on_delete=models.CASCADE)
	to_user = models.ForeignKey(User, related_name="friend_request_received", on_delete=models.CASCADE)
	status = models.CharField(choices=STATUS_CHOICES, default="requested")
	created = models.DateTimeField(datetime.now)

	class Meta:
		unique_together = ('from_user', 'to_user')
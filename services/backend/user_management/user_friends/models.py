from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now

STATUS_CHOICES = [
    ('requested', 'Requested'),
    ('accepted', 'Accepted'),
    ('rejected', 'Rejected'),
]

class Friendships(models.Model):
	from_user = models.ForeignKey(User, related_name="friend_resquest_sent", on_delete=models.CASCADE)
	to_user = models.ForeignKey(User, related_name="friend_request_received", on_delete=models.CASCADE)
	status = models.CharField(choices=STATUS_CHOICES, default="requested")
	created = models.DateTimeField(default=now)

	class Meta:
		unique_together = ('from_user', 'to_user')
		verbose_name = "Friendship"
		verbose_name_plural = "Friendships"
	
	def __str__(self):
		return f"{self.from_user.username}'s request to {self.to_user.username}"
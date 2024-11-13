from django.apps import AppConfig

class UserAuthConfig(AppConfig):
	default_auto_field = 'django.db.models.BigAutoField'
	name = 'user_auth'

	def ready(self):
		import user_profile.signals

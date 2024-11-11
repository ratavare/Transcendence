from django.apps import AppConfig

class IndexConfig(AppConfig):
	default_auto_field = 'django.db.models.BigAutoField'
	name = 'index'

	# def ready(self):
	# 	import services.backend.user_management.user_mng.signals
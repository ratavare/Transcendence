"""
ASGI config for game project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import re_path
from . import consumers

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'game.settings')

application = ProtocolTypeRouter({
	"http":get_asgi_application(),
	"websocket": AuthMiddlewareStack(
		URLRouter([
			re_path(r'ws/(?P<lobby_id>\w+)/$', consumers.Consumer.as_asgi()),
		])
	),
})

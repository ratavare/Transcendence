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
from game.consumers.pongConsumer import PongConsumer
from game.consumers.tournamentConsumer import TournamentConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'game.settings')

application = ProtocolTypeRouter({
	"http":get_asgi_application(),
	"websocket": AuthMiddlewareStack(
		URLRouter([
			re_path(r'pong/(?P<lobby_id>\w+)/$', PongConsumer.as_asgi()),
			re_path(r'pong/t/(?P<tournament_id>\w+)/$', TournamentConsumer.as_asgi())
		])
	),
})
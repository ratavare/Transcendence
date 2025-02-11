"""
ASGI config for user_mng project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from django.core.asgi import get_asgi_application
from user_messages.consumer import ChatConsumer
from .consumer import OnlineStatusConsumer
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'user_mng.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http":get_asgi_application(),
    "websocket":  AuthMiddlewareStack(
        URLRouter([
			path(f'chat/<str:room_id>/', ChatConsumer.as_asgi()),
            path(f'online-status/<str:username>/', OnlineStatusConsumer.as_asgi()),
		])
    )
})

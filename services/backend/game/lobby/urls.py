from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LobbyViewSet, createOrGetLobby

router = DefaultRouter()
router.register(r'lobbies', LobbyViewSet)

app_name = "lobby"
urlpatterns = [
    path('api/', include(router.urls)),
	path('lobbies/', createOrGetLobby.as_view()),
	path('lobbies/<str:lobby_id>/', createOrGetLobby.as_view()),
]

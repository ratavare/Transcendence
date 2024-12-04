from django.urls import path
from .views import lobbyView

app_name = "lobby"
urlpatterns = [
	path('lobbies/', lobbyView.as_view()),
	path('lobbies/<str:lobby_id>/', lobbyView.as_view()),
]
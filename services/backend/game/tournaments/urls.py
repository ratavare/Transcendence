from django.urls import path
from . import views

app_name = "tournament"
urlpatterns = [
	path('tournament/<str:tournament_id>', views.lobbies),
]
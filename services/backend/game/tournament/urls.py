from django.urls import path
from . import views

app_name = "tournament"
urlpatterns = [
	path('', views.createTournament),
	path('$<str:tournament_id>/', views.joinTournament),
	path('tournaments/', views.getTournaments)
]
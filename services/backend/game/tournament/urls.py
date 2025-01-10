from django.urls import path
from . import views

app_name = "tournament"
urlpatterns = [
	path('create/', views.tournamentView, name='create'),
]
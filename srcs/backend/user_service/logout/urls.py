
from django.urls import path

from . import views

app_name = "logout"
urlpatterns = [
	path("", views.logoutView, name="logout"),
	path("logoutSuccess/", views.logoutSuccessView, name="logoutSuccess"),
]

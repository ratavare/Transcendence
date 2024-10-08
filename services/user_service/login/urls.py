
from django.urls import path

from . import views

app_name = "login"
urlpatterns = [
	path("", views.loginView, name="login"),
	path("success/", views.successView, name="success"),
]

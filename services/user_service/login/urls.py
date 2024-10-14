
from django.urls import path

from . import views

app_name = "login"
urlpatterns = [
	path("login/", views.loginView, name="login"),
	path("loginSuccess/", views.loginSuccessView, name="loginSuccess"),
]

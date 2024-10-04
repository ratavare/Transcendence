
from django.urls import path

from . import views

app_name = "register"
urlpatterns = [
	path("api/register/", views.apiRegisterView, name="apiRegister"),
	path("register/", views.registerView, name="register"),
	path('register/user/', views.UsersView.as_view(), name="user"),
]

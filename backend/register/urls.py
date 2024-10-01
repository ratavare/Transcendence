
from django.urls import path

from . import views

app_name = "register"
urlpatterns = [
	path("", views.register, name="register"),
	path('user/', views.UsersView.as_view(), name="user"),
]

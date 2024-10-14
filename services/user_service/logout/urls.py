
from django.urls import path

from . import views

app_name = "logout"
urlpatterns = [
	path("logout/", views.logoutView, name="logout"),
]

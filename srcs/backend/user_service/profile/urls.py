
from django.urls import path
from .views import change_password, change_username

from . import views

app_name = "profile"
urlpatterns = [
	path("", views.profileView, name="profile"),
	path('account/delete/', views.account_delete, name='account_delete'),
	path('account/change_password/', views.change_password, name='change_password'),
	path('account/change_username/', views.change_username, name='change_username'),
	path('friends', views.friends, name='friends'),
]

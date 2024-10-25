from django.urls import path

from . import views

app_name = "profile"
urlpatterns = [
	path('', views.profileView, name="profile"),
	path('account/delete/', views.account_delete, name='account_delete'),
	path('friends/', views.friends, name='friends'),
]
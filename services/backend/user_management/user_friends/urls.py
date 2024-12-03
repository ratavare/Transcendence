from django.urls import path
from . import views

app_name = "user_friends"
urlpatterns = [
	path('friend-request-send/', views.sendFriendRequest),
	path('get-friends/', views.getFriends),
]
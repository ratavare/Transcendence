from django.urls import path
from . import views

app_name = "user_friends"
urlpatterns = [
	path('user_search/', views.userSearchView),
	path('friend-request-send/', views.sendFriendRequest),
	path('get-friends/', views.getFriends),
	path('friend-request/', views.friendRequest),
	path('handle-friend-request/', views.handleFriendRequest),
]
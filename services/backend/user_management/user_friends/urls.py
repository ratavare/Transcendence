from django.urls import path
from . import views

app_name = "user_friends"
urlpatterns = [
	path('user_search/', views.userSearchView),
	path('friend-request-send/', views.sendFriendRequest),
	path('get-friends/', views.getFriends),
	path('get-friend-requests/', views.getfriendRequests),
	path('handle-friend-request/', views.handleFriendRequest),
    path('delete-friend/', views.deleteFriend),
]
from django.urls import path
from . import views
from .views import UnifiedFriendshipAPI

app_name = "user_friends"
urlpatterns = [
	path('user_search/', views.friendSearchView),
	path('friend-request-send/', views.sendFriendRequest),
	path('get-friends/', views.getFriends),
	path('get-friend-requests/', views.getFriendRequests),
	path('get-sent-friend-requests/', views.getSentFriendRequests),
	path('handle-friend-request/', views.handleFriendRequest),
	path('delete-friend/', views.deleteFriend),
	path('delete-friend-request/', views.deleteFriendRequest),
	path('api/', UnifiedFriendshipAPI.as_view()),
]
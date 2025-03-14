from django.urls import path
from . import views

app_name = "user_profile"
urlpatterns = [
	path('profile/', views.profileView),
    path('profile/picture/<str:username>/', views.profilePicture),
    path('profile/<str:username>/', views.foreignProfile),
    path('profile/updatewinloss/', views.updateWinLoss),
]
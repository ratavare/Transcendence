from django.urls import path
from . import views

app_name = "user_auth"
urlpatterns = [
	path('register/', views.registerView),
	path('login/', views.loginView),
	path('logout/', views.logoutView),
	path('user_search/', views.userSearchView),
]

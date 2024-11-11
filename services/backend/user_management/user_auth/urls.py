from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from user_auth import views

app_name = "user_auth"
urlpatterns = [
	path('register/', views.registerView, name='register'),
	path('login/', views.loginView, name='login'),
	path('logout/', views.logoutView, name='logout'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

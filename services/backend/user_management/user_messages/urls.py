from django.urls import path
from . import views

app_name = "user_messages"
urlpatterns = [
    path('conversations/', views.getConversations),
    path('conversations/<str:conversation_id>/', views.getMessages),
]
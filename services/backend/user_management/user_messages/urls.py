from django.urls import path
from . import views

app_name = "user_messages"
urlpatterns = [
    path('conversations/', views.getConversations),
    path('conversations/create/<str:friend>/', views.startConversation),
    path('conversations/<str:conversation_id>/', views.getMessages),
]
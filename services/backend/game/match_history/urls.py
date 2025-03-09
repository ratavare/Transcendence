from django.urls import path
from .views import MatchHistoryListView

app_name = "match_history"

urlpatterns = [
    path('api/<str:username>/', MatchHistoryListView.as_view(), name='match_history_api'),
]
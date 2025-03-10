from rest_framework.views import APIView
from rest_framework.response import Response
from .models import MatchHistory
from .serializers import MatchHistorySerializer
from django.contrib.auth.models import User

class MatchHistoryListView(APIView):
    def get(self, request, username):
        matches = MatchHistory.objects.filter(users__username=username).order_by('-date')[:10]
        serializer = MatchHistorySerializer(matches, many=True)
        return Response(serializer.data)
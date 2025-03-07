from rest_framework.views import APIView
from rest_framework.response import Response
from .models import MatchHistory
from .serializers import MatchHistorySerializer

class MatchHistoryListView(APIView):
    def get(self, request, username):
        matches = MatchHistory.objects.order_by('-date')[:10]
        serializer = MatchHistorySerializer(matches, many=True)
        return Response(serializer.data)
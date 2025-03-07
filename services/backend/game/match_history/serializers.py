from rest_framework import serializers
from .models import MatchHistory

class MatchHistorySerializer(serializers.ModelSerializer):
    users = serializers.SlugRelatedField(
        many=True, slug_field='username', queryset=MatchHistory.objects.all()
    )

    class Meta:
        model = MatchHistory
        fields = ['game_id', 'users', 'player1Score', 'player2Score', 'date']

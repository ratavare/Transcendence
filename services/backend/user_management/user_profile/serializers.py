from rest_framework import serializers
from .models import Friendships

class Friendshipserializer(serializers.ModelSerializer):
    class Meta:
        model = Friendships
        fields = ['from_user', 'to_user', 'status', 'created']  # List all fields you want to include

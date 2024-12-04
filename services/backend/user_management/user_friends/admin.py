from django.contrib import admin
from .models import Friendships

# Register your models here.

@admin.register(Friendships)
class FriendshipsAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_user', 'status', 'created')  # Add the 'created' field
    list_filter = ('status', 'created')  # Optional: Filter by 'status' and 'created'
    search_fields = ('from_user__username', 'to_user__username')  # Optional: Enable search by usernames
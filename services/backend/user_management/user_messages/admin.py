from django.contrib import admin
from .models import Message, Conversation

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
	pass

# Register your models here.
@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
	list_display = ('__str__', 'content', 'timestamp')
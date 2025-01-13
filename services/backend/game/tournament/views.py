import json
from django.shortcuts import render
from django.http import JsonResponse
from .models import Tournament
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

# id = "asdsad"


# html ->  Create Tournament [...]
# js -> fetch('/path/endpoint/t' ,POST, tournament_id)

# Backend Django:
# urls -> /path/endpoint/t -> functionView()
# views -> functionView({
#     criar entradaDB:
#     if tourment_id
#         newTournament = Tournament.objects.create(tournament_id=tournament_id)
#         newTournament.save()
#         return JsonResponse("success!!", DeprecationWarning)
#     return
# })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createTournament(request):
	if request.method == "POST":
		validator = RegexValidator('[+/%!?,.$%#&*]', inverse_match=True)
		try:
			id = request.data.get('tournament_id')
			validator(id)
			tournament = Tournament.objects.create(tournament_id=id)
			tournament.save()
			return JsonResponse({'tournament_id': id}, status=200)
		except ValidationError:
				return JsonResponse({'error': 'Regex'}, status=400)
		except:
			return JsonResponse({'error': 'Other error'}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def joinTournament(request, tournament_id):
	try:
		data = json.loads(request.body.decode('utf-8'))
		if isinstance(data, str):
			data = json.loads(data)
		username = data.get('username')
		user = User.objects.get(username=username)
		selectedTorunament = Tournament.objects.get(tournament_id=tournament_id)
		selectedTorunament.players.add(user)
		selectedTorunament.save()
		return JsonResponse({'status': 'success'}, status=200)
	except Tournament.DoesNotExist:
		return JsonResponse({'error': 'Lobby does not exist'}, status=400)
	except User.DoesNotExist:
		return JsonResponse({'error': 'User does not exist'}, status=400)
	except:
		return JsonResponse({'error': 'Other error'}, status=400)
	

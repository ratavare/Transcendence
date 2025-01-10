from django.shortcuts import render
from django.http import JsonResponse
from .models import Tournament
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

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def tournamentView(request):
	if request.method == "POST":
		validator = RegexValidator('[+\/%!?,.$%#&*]', inverse_match=True)
		try:
			id = request.data.get('tournament_id')
			validator(id)
			tournament = Tournament.objects.create(tournament_id=id)
			tournament.save()
			return JsonResponse({"status":"success"}, status=200)
		except ValidationError:
				return JsonResponse({'error': 'Regex'}, status=400)
		except:
			return JsonResponse({'error': 'Other error'}, status=400)
	if request.method == "GET":
		pass
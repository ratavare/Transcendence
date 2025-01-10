from django.shortcuts import render
from django.http import JsonResponse
from .models import Tournament

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

def tournament_view(request, tournament_id):
    if request.method == "POST":
        tournament = Tournament.objects.create(tournament_id=tournament_id)
        tournament.save()
        return JsonResponse({"status":"success"}, status=200)
    return JsonResponse(status=400)
    
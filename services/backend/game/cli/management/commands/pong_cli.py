import requests
from django.core.management.base import BaseCommand

class Command(BaseCommand):

    def handle(self, *args, **options):
        self.stdout.write("Welcome to CLI Pong! This will allow you to create a new lobby.")
        lobby_id = input("Enter lobby ID: ")

        response = requests.post("http://game:8002/lobby/cli_lobby/", json={"lobby_id": lobby_id})

        if response.status_code == 200:
            self.stdout.write(f"Lobby '{lobby_id}' created successfully!")
        else:
            self.stdout.write(f"Error: {response.json().get('error', 'Unknown error')}")


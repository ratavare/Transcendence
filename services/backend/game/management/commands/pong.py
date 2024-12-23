from django.core.management.base import BaseCommand
from django.contrib.auth import authenticate
import getpass, requests

class Command(BaseCommand):
	
	def handle(self, *args, **options):
		self.stdout.write("Welcome to CLI Pong!")
		self.run()

	def run(self):
		if self.login():
			while True:
				self.stdout.write("Hello!")

	def login(self):
		username = input("Enter your username: ")

		if username is not None:
			self.stdout.write(f"Welcome {username}!")
			return True
		self.stdout.write("Invalid username")
		return False
	
	def run():
		pass

#!/bin/bash

python manage.py runserver 0.0.0.0:8002
daphne game.asgi:application
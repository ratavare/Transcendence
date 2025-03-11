#!/bin/bash

BOLD_CYAN="\e[1;36m"
NC="\e[0m"

#Exits if any command exits with an error (!= 0)
set -e

echo "${BOLD_CYAN}Creating migrations...${NC}"
python manage.py makemigrations

echo "${BOLD_CYAN}Migrating...${NC}"
python manage.py migrate

echo "${BOLD_CYAN}Starting the server...${NC}"

python manage.py runserver 0.0.0.0:8000

FROM python:latest

WORKDIR /game

COPY . .
 
RUN pip install --upgrade pip daphne

RUN pip install -r requirements.txt

EXPOSE 8002

RUN rm /usr/local/lib/python3.13/site-packages/django/views/templates/technical_404.html
COPY 404.html /usr/local/lib/python3.13/site-packages/django/views/templates/technical_404.html

CMD [ "sh", "script.sh" ]

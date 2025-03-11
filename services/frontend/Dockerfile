FROM python:latest

WORKDIR /frontend

COPY . .


RUN pip install --upgrade pip

RUN pip install -r requirements.txt

EXPOSE 8000

RUN rm /usr/local/lib/python3.13/site-packages/django/views/templates/technical_404.html
COPY ./index/templates/404.html /usr/local/lib/python3.13/site-packages/django/views/templates/technical_404.html

CMD [ "sh", "script.sh" ]




FROM python:latest

WORKDIR /game

COPY . .
 
RUN pip install --upgrade pip daphne

RUN pip install -r requirements.txt

EXPOSE 8002

CMD [ "sh", "script.sh" ]

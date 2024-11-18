FROM python:latest

WORKDIR /game

COPY . .
 
RUN pip install --upgrade pip

RUN pip install -r requirements.txt

EXPOSE 8002

ENTRYPOINT [ "python", "manage.py", "runserver", "0.0.0.0:8002"]
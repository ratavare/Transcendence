FROM python:latest

WORKDIR /frontend

COPY . .

RUN pip install --upgrade pip

RUN pip install -r requirements.txt

EXPOSE 8000

CMD [ "sh", "script.sh" ]




FROM python:latest

WORKDIR /user_management

COPY . .
 
RUN pip install --upgrade pip

RUN pip install -r requirements.txt

EXPOSE 8001

CMD [ "sh", "script.sh" ]
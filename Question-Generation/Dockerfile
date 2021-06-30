FROM python:3.9.5

RUN mkdir /usr/src/app/qgen
WORKDIR /usr/src/app/qgen

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "python", "./wsgi.py" ]
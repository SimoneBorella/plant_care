FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV MQTT_BROKER=mosquitto \
    MQTT_PORT=1883 \
    MONGODB_URI=mongodb://plantcare-mongo:27017/plantcare \
    PYTHONUNBUFFERED=1

CMD ["supervisord", "-c", "supervisord.conf"]

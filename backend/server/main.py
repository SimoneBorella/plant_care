from fastapi import FastAPI
import paho.mqtt.client as mqtt

# MQTT Topics - (topic, QoS)
sub_topics = [("humidity", 0), ("temperature", 0)]


app = FastAPI()
latest_humidity = None
latest_temperature = None

def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT broker")
    client.subscribe(sub_topics)
    print("Subscribed to topics:", sub_topics)

def on_message(client, userdata, msg):
    global latest_humidity
    latest_humidity = float(msg.payload.decode())

mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

mqtt_client.connect("mosquitto", 1883)
mqtt_client.loop_start()

@app.get("/api/humidity")
def get_humidity():
    if latest_humidity is None:
        return {"error": "No data yet"}
    return {"value": latest_humidity}

@app.get("/api/temperature")
def get_temperature():
    if latest_temperature is None:
        return {"error": "No data yet"}
    return {"value": latest_temperature}

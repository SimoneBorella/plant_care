import json
import time
from datetime import datetime, timedelta
from pymongo import MongoClient, UpdateOne
import paho.mqtt.client as mqtt
from apscheduler.schedulers.background import BackgroundScheduler


client = MongoClient("mongodb://localhost:27017")
db = client["plantcare"]
devices_col = db["devices"]


MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPICS = [("/devices/+/info", 0), ("/devices/+/heartbeat", 0)]




def update_device_info(device_id, available_slots):
    now = datetime.utcnow()

    existing = devices_col.find_one({"device_id": device_id})

    if existing:
        slot_assignment = existing.get("slot_assignment", {})
    else:
        slot_assignment = {}

    for slot in available_slots:
        slot_str = str(slot)
        if slot_str not in slot_assignment:
            slot_assignment[slot_str] = None

    for slot_str in list(slot_assignment.keys()):
        if int(slot_str) not in available_slots:
            del slot_assignment[slot_str]

    devices_col.update_one(
        {"device_id": device_id},
        {
            "$set": {
                "available_slots": available_slots,
                "slot_assignment": slot_assignment,
                "last_seen": now,
                "online": True,
            },
            "$setOnInsert": {"name": None},
        },
        upsert=True
    )

def update_heartbeat(device_id):
    devices_col.update_one(
        {"device_id": device_id},
        {"$set": {"last_seen": datetime.utcnow(), "online": True}},
        upsert=True
    )

def check_offline_devices(timeout_seconds):
    threshold = datetime.utcnow() - timedelta(seconds=timeout_seconds)
    result = devices_col.update_many(
        {"last_seen": {"$lt": threshold}},
        {"$set": {"online": False}}
    )
    if result.modified_count > 0:
        print(f"Marked {result.modified_count} device(s) as offline")


def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT Broker:", rc)
    for topic, qos in MQTT_TOPICS:
        client.subscribe(topic)
        print(f"Subscribed to {topic}")

def on_message(client, userdata, msg):
    topic = msg.topic
    payload = json.loads(msg.payload.decode())
    device_id = payload.get("device_id")

    if topic.endswith("/info"):
        available_slots = payload.get("available_slots", [])
        update_device_info(device_id, available_slots)
        print(f"Updated info for {device_id}")
    elif topic.endswith("/heartbeat"):
        update_heartbeat(device_id)
        print(f"{device_id} alive at {datetime.utcnow()}")


scheduler = BackgroundScheduler()
scheduler.add_job(check_offline_devices, "interval", seconds=2)
scheduler.start()


client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_forever()

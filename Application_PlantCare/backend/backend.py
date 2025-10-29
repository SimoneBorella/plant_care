import json
from bson import json_util
import time
import asyncio
import threading
from datetime import datetime, timedelta
from pymongo import MongoClient
import paho.mqtt.client as mqtt
from apscheduler.schedulers.background import BackgroundScheduler
import websockets

# MongoDB
client = MongoClient("mongodb://localhost:27017")
db = client["plantcare"]
devices_col = db["devices"]

# MQTT
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPICS = [("/devices/+/info", 0), ("/devices/+/heartbeat", 0)]

# WebSocket global state
connected_clients = set()


# Global asyncio loop
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)


async def broadcast_devices():
    """Send all devices to all connected WebSocket clients."""
    devices = list(devices_col.find({}, {"_id": 0}))
    # payload = json.dumps(devices)
    payload = json_util.dumps(devices)

    to_remove = set()
    for ws in connected_clients:
        try:
            await ws.send(payload)
        except Exception:
            to_remove.add(ws)

    for ws in to_remove:
        connected_clients.remove(ws)

async def ws_handler(websocket):
    """Handle WebSocket client connection."""
    connected_clients.add(websocket)
    print("Client connected via WebSocket")
    try:
        await broadcast_devices()
        async for _ in websocket:
            pass
    except:
        pass
    finally:
        connected_clients.remove(websocket)
        print("Client disconnected")

# async def ws_handler(websocket):
#     connected_clients.add(websocket)
#     print("Client connected via WebSocket")

#     try:
#         await broadcast_devices()

#         while True:
#             msg = await websocket.recv()
#             if msg is None:
#                 break
#     except Exception as e:
#         print("WebSocket error:", e)
#     finally:
#         connected_clients.remove(websocket)
#         print("Client disconnected")




def broadcast_devices_safe():
    asyncio.run_coroutine_threadsafe(broadcast_devices(), loop)


# Database & MQTT Logic
def update_device_info(device_id, available_slots):
    now = datetime.utcnow()
    existing = devices_col.find_one({"device_id": device_id})
    slot_assignment = existing.get("slot_assignment", {}) if existing else {}

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
        upsert=True,
    )

    # Broadcast update
    broadcast_devices_safe()

def update_heartbeat(device_id):
    devices_col.update_one(
        {"device_id": device_id},
        {"$set": {"last_seen": datetime.utcnow(), "online": True}},
        upsert=True,
    )

    # Broadcast update
    broadcast_devices_safe()

def check_offline_devices(timeout_seconds):
    threshold = datetime.utcnow() - timedelta(seconds=timeout_seconds)
    result = devices_col.update_many(
        {"last_seen": {"$lt": threshold}},
        {"$set": {"online": False}},
    )
    if result.modified_count > 0:
        print(f"Marked {result.modified_count} device(s) as offline")
        broadcast_devices_safe()

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





# Background scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(check_offline_devices, "interval", seconds=5, args=[5])
scheduler.start()

# MQTT loop
mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)

def mqtt_loop():
    mqtt_client.loop_forever()

threading.Thread(target=mqtt_loop, daemon=True).start()

# Start WebSocket server
async def main():
    async with websockets.serve(ws_handler, "0.0.0.0", 3001):
        print("WebSocket server running on ws://0.0.0.0:3001")
        await asyncio.Future()

loop.run_until_complete(main())
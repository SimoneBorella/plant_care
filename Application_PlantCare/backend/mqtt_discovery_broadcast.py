import socket
import time
import os

BROADCAST_IP = "255.255.255.255"
PORT = 1884
BROKER_PORT = 1883


def get_local_ip():
    """
    Ottiene l'IP locale del container in modo affidabile.
    """
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip


def main():
    broker_ip = get_local_ip()
    message = f"BROKER:{broker_ip}:{BROKER_PORT}".encode()

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)

    print(f"MQTT Discovery Broadcaster started")
    print(f"Announcing broker at {broker_ip}:{BROKER_PORT}")
    print(f"Broadcasting every 5 seconds on UDP port {PORT}...")

    while True:
        sock.sendto(message, (BROADCAST_IP, PORT))
        time.sleep(5)


if __name__ == "__main__":
    main()

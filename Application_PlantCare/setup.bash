#!/bin/bash

# Mosquitto setup
mkdir /srv/mosquitto/config /srv/mosquitto/data /srv/mosquitto/log -p
cp ./mosquitto/mosquitto.conf /srv/mosquitto/config/mosquitto.conf

# MongoDB setup
mkdir -p /srv/mongodb/data
chown -R 1001:1001 /srv/mongodb/data
chmod -R 700 /srv/mongodb/data
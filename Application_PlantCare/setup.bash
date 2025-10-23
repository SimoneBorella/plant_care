#!/bin/bash

# Mosquitto setup
mkdir /srv/mosquitto/config /srv/mosquitto/data /srv/mosquitto/log -p
cp mosquitto.conf /srv/mosquitto/config/mosquitto.conf

# CouchDB setup
mkdir /srv/couchdb/data -p
sudo chown -R 1000:1000 /srv/couchdb/data

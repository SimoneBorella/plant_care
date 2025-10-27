FROM eclipse-mosquitto:latest

RUN apk update && \
    apk add --no-cache avahi dbus bash

RUN echo "mqtt" > /etc/hostname

COPY mosquitto.conf /mosquitto/config/mosquitto.conf

CMD sh -c "rc-update add dbus && rc-update add avahi-daemon && /usr/sbin/dbus-daemon --system && /usr/sbin/avahi-daemon --no-chroot && mosquitto -c /mosquitto/config/mosquitto.conf"

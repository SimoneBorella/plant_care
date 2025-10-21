# plant_care_system
Automated plant care system for plant watering and lighting

## Server side

### API

- GET `/api/humidity`
  - request
    - parameters: none
    - body content: none
  - response body content: json {value} with huidity value


- GET `/api/temperature`
  - request
    - parameters: none
    - body content: none
  - response body content: json {temperature} with temperature value



## MQTT client

Publish topic:
```
mosquitto_pub -h borella-pi4 -t humidity -m 50
```

Subscribe topic:
```
mosquitto_sub -h borella-pi4 -t test
```
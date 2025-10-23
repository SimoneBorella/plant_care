# plant_care_system
Automated plant care system for plant watering and lighting

## Server side
Setup mqtt stream directory:
```
./setup.bash
```


Build backend system:
```
docker compose build
```

Run and stop backend system:
```
docker compose up
docker compose down
```




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
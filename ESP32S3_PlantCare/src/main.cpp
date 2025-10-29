#include <Adafruit_NeoPixel.h>
#include <WiFi.h>
#include <WiFiUdp.h>
#include <PubSubClient.h>

// ----------------------------
// Configuration
// ----------------------------

#define LED_PIN 48
#define LED_COUNT 1



const int NUM_SLOTS = 1;
const int PLANT_SLOTS[NUM_SLOTS] = {0};

const int SOIL_PINS[NUM_SLOTS] = {14};
// const int TEMP_PINS[NUM_SLOTS] = {0};


String soil_topics[NUM_SLOTS];
// String temp_topics[NUM_SLOTS];





#define SOIL_MOISTURE_SENSOR_PIN 14

// const char* WIFI_SSID = "WifiCasa";
// const char* WIFI_PASSWORD = "h8ffAyDNHDDkYAqN";

const char* WIFI_SSID = "iliadbox-69DF6E";
const char* WIFI_PASSWORD = "hkvxnqsh5xqd9zsrqwsv2v";

// Fallback IP (usato se non riceviamo discovery)
const char* MQTT_SERVER_FALLBACK = "192.168.1.9";
const int   MQTT_PORT_FALLBACK = 1883;

const int UDP_LISTEN_PORT = 1884;   // Porta dove ascoltare i messaggi broadcast
const int UDP_TIMEOUT_MS = 5000;    // Timeout in ms per discovery

const int MQTT_INFO_PUBLISH_INTERVAL = 10000;
const int MQTT_HEARTBEAT_PUBLISH_INTERVAL = 5000;
const int MQTT_SENSOR_PUBLISH_INTERVAL = 2000;

const int SOIL_MOISTURE_WET = 1040;
const int SOIL_MOISTURE_DRY = 2585;

// ----------------------------
// Objects
// ----------------------------
Adafruit_NeoPixel LED_RGB(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);
WiFiClient wifiClient;
PubSubClient client(wifiClient);
WiFiUDP udp;

IPAddress mqttServerIP;
int mqttServerPort = MQTT_PORT_FALLBACK;
bool mqttDiscovered = false;

uint16_t hue = 0;

unsigned long lastInfoMsg = 0;
unsigned long lastHeartbeatMsg = 0;
unsigned long lastSensorMsg = 0;

// ----------------------------
// Dynamic Client ID
// ----------------------------
String clientId;



// ----------------------------
// Functions
// ----------------------------
void setup_wifi() {
  LED_RGB.setPixelColor(0, LED_RGB.Color(255, 0, 0));
  LED_RGB.show();

  Serial.print("Connecting to WiFi ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

bool discoverMQTTviaUDP() {
  Serial.println("Listening for MQTT broker broadcast...");
  udp.begin(UDP_LISTEN_PORT);
  unsigned long start = millis();

  while (millis() - start < UDP_TIMEOUT_MS) {
    int packetSize = udp.parsePacket();
    if (packetSize) {
      char packet[255];
      int len = udp.read(packet, 254);
      if (len > 0) packet[len] = '\0';
      Serial.print("UDP packet received: ");
      Serial.println(packet);

      // Format expected: BROKER:192.168.1.9:1883
      if (strncmp(packet, "BROKER:", 7) == 0) {
        String data = String(packet + 7);
        int colonIndex = data.indexOf(':');
        String ipStr = data.substring(0, colonIndex);
        String portStr = data.substring(colonIndex + 1);
        mqttServerIP.fromString(ipStr);
        mqttServerPort = portStr.toInt();

        Serial.print("Discovered MQTT broker: ");
        Serial.print(mqttServerIP);
        Serial.print(":");
        Serial.println(mqttServerPort);
        mqttDiscovered = true;
        udp.stop();
        return true;
      }
    }
    delay(100);
  }

  Serial.println("No broadcast received. Using fallback MQTT server.");
  udp.stop();
  return false;
}

void reconnect_mqtt_server() {
  LED_RGB.setPixelColor(0, LED_RGB.Color(255, 0, 0));
  LED_RGB.show();

  while (!client.connected()) {
    Serial.print("Connecting to MQTT broker at ");
    Serial.print(mqttServerIP);
    Serial.print(":");
    Serial.println(mqttServerPort);

    if (client.connect(clientId.c_str())) {
      Serial.println("MQTT broker connected!");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" retry in 5s");
      delay(5000);
    }
  }
}












// ----------------------------
// Subscription Callback
// ----------------------------

void callback(char* topic, byte* message, unsigned int length) {
  String payload;
  for (unsigned int i = 0; i < length; i++) {
    payload += (char)message[i];
  }

  Serial.print("Received [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(payload);
}










// ----------------------------
// Publishing Functions
// ----------------------------

void publishSensorData() {
  for(int i = 0; i < NUM_SLOTS; i++) {
    int soilAnalogValue = analogRead(SOIL_PINS[i]);
    int soilValue = map(soilAnalogValue, SOIL_MOISTURE_WET, SOIL_MOISTURE_DRY, 0, 100);
    soilValue = 100 - soilValue;
    String soilMessage = String(soilValue);

    client.publish(soil_topics[i].c_str(), soilMessage.c_str());
    Serial.print("Published [");
    Serial.print(soil_topics[i]);
    Serial.print("] : ");
    Serial.println(soilMessage);
  }
}

void publishInfo() {
  String payload = "{ \"device_id\": \"" + clientId + "\", \"available_slots\": [";
  for(int i = 0; i < NUM_SLOTS; i++) {
    payload += String(PLANT_SLOTS[i]);
    if(i < NUM_SLOTS-1) payload += ",";
  }
  payload += "] }";

  String topic = "/devices/" + clientId + "/info";
  client.publish(topic.c_str(), payload.c_str());
  Serial.print("Published [");
  Serial.print(topic);
  Serial.print("] : ");
  Serial.println(payload);
}

void publishHeartbeat() {
  String topic = "/devices/" + clientId + "/heartbeat";
  String payload = "{ \"device_id\": \"" + clientId + "\" }";
  client.publish(topic.c_str(), payload.c_str());
  Serial.print("Published [");
  Serial.print(topic);
  Serial.print("] : ");
  Serial.println(payload);
}














// ----------------------------
// Setup
// ----------------------------
void setup() {
  Serial.begin(115200);
  delay(1000);

  LED_RGB.begin();
  LED_RGB.setBrightness(10);
  LED_RGB.show();

  setup_wifi();

  uint64_t chipid = ESP.getEfuseMac();
  clientId = "esp_" + String((uint16_t)(chipid >> 32), HEX) + String((uint32_t)chipid, HEX);

  Serial.print("Client id: ");
  Serial.println(clientId);

  for (int i = 0; i < NUM_SLOTS; i++) {
    int slot = PLANT_SLOTS[i];
    soil_topics[i] = "/plant_care/" + clientId + "/" + String(slot) + "/soil_moisture";
    // temp_topics[i] = "/plant_care/" + clientId + "/" + String(slot) + "/temperature";
  }

  if (!discoverMQTTviaUDP()) {
    mqttServerIP.fromString(MQTT_SERVER_FALLBACK);
    mqttServerPort = MQTT_PORT_FALLBACK;
  }

  client.setServer(mqttServerIP, mqttServerPort);
  client.setCallback(callback);
}

// ----------------------------
// Loop
// ----------------------------
void loop() {
  if (!client.connected()) {
    reconnect_mqtt_server();
  }
  client.loop();

  // LED effect
  uint32_t color = LED_RGB.ColorHSV(hue);
  color = LED_RGB.gamma32(color);
  LED_RGB.setPixelColor(0, color);
  LED_RGB.show();

  hue += 8;
  if (hue >= 65536) hue = 0;


  unsigned long now = millis();

  // Sensor data publishing
  if(now - lastSensorMsg >= MQTT_SENSOR_PUBLISH_INTERVAL){
    lastSensorMsg = now;
    publishSensorData();
  }

  // Info publishing
  if(now - lastInfoMsg >= MQTT_INFO_PUBLISH_INTERVAL){
    lastInfoMsg = now;
    publishInfo();
  }

  // Heartbeat publishing
  if(now - lastHeartbeatMsg >= MQTT_HEARTBEAT_PUBLISH_INTERVAL){
    lastHeartbeatMsg = now;
    publishHeartbeat();
  }

}

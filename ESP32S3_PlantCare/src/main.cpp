#include <Adafruit_NeoPixel.h>
#include <WiFi.h>
#include <WiFiUdp.h>
#include <PubSubClient.h>

// ----------------------------
// Configuration
// ----------------------------
#define LED_PIN 48
#define LED_COUNT 1
#define SOIL_MOISTURE_SENSOR_PIN 14

const char* WIFI_SSID = "WifiCasa";
const char* WIFI_PASSWORD = "h8ffAyDNHDDkYAqN";

// Fallback IP (usato se non riceviamo discovery)
const char* MQTT_SERVER_FALLBACK = "192.168.1.9";
const int   MQTT_PORT_FALLBACK = 1883;

const int UDP_LISTEN_PORT = 1884;   // Porta dove ascoltare i messaggi broadcast
const int UDP_TIMEOUT_MS = 5000;    // Timeout in ms per discovery

const char* MQTT_SOIL_MOISTURE_TOPIC = "plantcare/sudowoodo/soilmoisture";
const int MQTT_PUBLISH_INTERVAL = 5000;

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
unsigned long lastMsg = 0;

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

    String clientId = "ESP32S3-";
    clientId += String(random(0xffff), HEX);

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
// Setup
// ----------------------------
void setup() {
  Serial.begin(115200);
  delay(1000);

  LED_RGB.begin();
  LED_RGB.setBrightness(10);
  LED_RGB.show();

  setup_wifi();

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

  // Publish soil moisture
  unsigned long now = millis();
  if (now - lastMsg > MQTT_PUBLISH_INTERVAL) {
    lastMsg = now;
    // int analogValue = analogRead(SOIL_MOISTURE_SENSOR_PIN);
    // int soilMoistureValue = map(analogValue, SOIL_MOISTURE_WET, SOIL_MOISTURE_DRY, 0, 100);
    // soilMoistureValue = 100 - soilMoistureValue;
    // String message = String(soilMoistureValue);

    int randomValue = random(0, 101);
    String message = String(randomValue);

    client.publish(MQTT_SOIL_MOISTURE_TOPIC, message.c_str());
    Serial.print("Published: ");
    Serial.println(message);
  }
}

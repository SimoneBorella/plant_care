#include <Adafruit_NeoPixel.h>
#include <WiFi.h>
#include <PubSubClient.h>

// Configuration

#define LED_PIN 48
#define LED_COUNT 1
#define SOIL_MOISTURE_SENSOR_PIN 14

// const char* WIFI_SSID = "iliadbox-69DF6E";
// const char* WIFI_PASSWORD = "hkvxnqsh5xqd9zsrqwsv2v";

const char* WIFI_SSID = "WifiCasa";
const char* WIFI_PASSWORD = "h8ffAyDNHDDkYAqN";

const char* MQTT_SERVER = "192.168.1.9";
const int   MQTT_PORT = 1883;
const char* MQTT_SOIL_MOISTURE_TOPIC = "plantcare/sudowoodo/soilmoisture";
const int MQTT_PUBLISH_INTERVAL = 5000;

const int SOIL_MOISTURE_WET = 1040;
const int SOIL_MOISTURE_DRY = 2585;


// Objects
Adafruit_NeoPixel LED_RGB(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);
WiFiClient wifiClient;
PubSubClient client(wifiClient);

uint16_t hue = 0;
unsigned long lastMsg = 0;


void setup_wifi() {
  LED_RGB.setPixelColor(0, LED_RGB.Color(255, 0, 0));
  LED_RGB.show();

  delay(10);
  Serial.println();
  Serial.print("Connecting to WiFi with SSID ");
  Serial.print(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}


void reconnect_mqtt_server() {
  LED_RGB.setPixelColor(0, LED_RGB.Color(255, 0, 0));
  LED_RGB.show();

  while (!client.connected()) {
    Serial.print("Connecting to MQTT broker at ");
    Serial.println(MQTT_SERVER);

    String clientId = "ESP32S3-";
    clientId += String(random(0xffff), HEX);
    if (client.connect(clientId.c_str())) {
      Serial.println("MQTT broker connected");
      
      // client.subscribe(MQTT_SOIL_MOISTURE_TOPIC);
      // Serial.print("Subscribed to: ");
      // Serial.println(MQTT_SOIL_MOISTURE_TOPIC);
    } else {
      Serial.print("Failed with rc=");
      Serial.print(client.state());
      Serial.println(", retrying in 5 seconds...");
      delay(5000);
    }
  }
}


void callback(char* topic, byte* message, unsigned int length) {
  String payload;
  for (unsigned int i = 0; i < length; i++) {
    payload += (char)message[i];
  }

  Serial.print("Received: ");
  Serial.print(topic);
  Serial.print(" - ");
  Serial.println(payload);
}


void setup() {
  Serial.begin(9600);
  delay(2000);

  LED_RGB.begin();
  LED_RGB.setBrightness(100);
  LED_RGB.show();

  setup_wifi();
  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect_mqtt_server();
  }
  client.loop();



  // Convert hue (0–65535) to RGB color
  uint32_t color = LED_RGB.ColorHSV(hue);

  // Apply gamma correction
  color = LED_RGB.gamma32(color);

  LED_RGB.setPixelColor(0, color);
  LED_RGB.show();

  hue += 8;
  if (hue >= 65536) hue = 0; 




  unsigned long now = millis();
  if (now - lastMsg > MQTT_PUBLISH_INTERVAL) {
    lastMsg = now;

    int analogValue = analogRead(SOIL_MOISTURE_SENSOR_PIN);
    int soilMoistureValue = map(analogValue, SOIL_MOISTURE_WET, SOIL_MOISTURE_DRY, 0, 100);
    
    soilMoistureValue = 100 - soilMoistureValue;

    String message = String(soilMoistureValue);

    client.publish(MQTT_SOIL_MOISTURE_TOPIC, message.c_str());

    Serial.print("Published: ");
    Serial.print(MQTT_SOIL_MOISTURE_TOPIC);
    Serial.print(" - ");
    Serial.println(message);
  }
}

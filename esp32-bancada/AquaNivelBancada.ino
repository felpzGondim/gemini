/*
  AquaNível — teste de bancada (1x JSN-SR04T)
  Placa: ESP32 DevKit

  O JSN-SR04T no modo padrão (como vem de fábrica) usa Trig + Echo,
  igual ao HC-SR04. Não solde o resistor de modo serial.

  Zona cega: ~20 cm. Não cole a mão no sensor.
  Aponte para o chão, uma parede ou uma caixa a 25–150 cm.

  Monitor Serial: 115200
  Wi-Fi opcional: preencha SSID/senha para abrir uma página no celular.
*/

#include <WiFi.h>
#include <WebServer.h>

const int PIN_TRIG = 5;
const int PIN_ECHO = 18;

// Altura da "caixa" no teste (cm). Distância pequena = mais cheia.
const float ALTURA_CAIXA_CM = 100.0;
const float DISTANCIA_MIN_CM = 20.0;

const char* WIFI_SSID = "";
const char* WIFI_PASS = "";

WebServer server(80);

float lerDistanciaCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(5);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(20);
  digitalWrite(PIN_TRIG, LOW);

  unsigned long us = pulseIn(PIN_ECHO, HIGH, 60000);
  if (us == 0) return -1;
  return (us * 0.0343f) / 2.0f;
}

int nivelPercent(float distancia) {
  if (distancia < 0) return -1;
  if (distancia < DISTANCIA_MIN_CM) distancia = DISTANCIA_MIN_CM;
  float agua = ALTURA_CAIXA_CM - distancia;
  if (agua < 0) agua = 0;
  if (agua > ALTURA_CAIXA_CM) agua = ALTURA_CAIXA_CM;
  return (int)((agua / ALTURA_CAIXA_CM) * 100.0f);
}

void pagina() {
  float d = lerDistanciaCm();
  int p = nivelPercent(d);
  String html = "<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>";
  html += "<title>Bancada AquaNível</title>";
  html += "<body style='font-family:sans-serif;background:#eef6f7;color:#102a33;padding:24px'>";
  html += "<h1>JSN-SR04T</h1>";
  if (d < 0) {
    html += "<p>Sem eco — aponte o transdutor para uma superfície a mais de 20 cm.</p>";
  } else {
    html += "<p style='font-size:42px;margin:8px 0'><b>" + String(p) + "%</b></p>";
    html += "<p>Distância: " + String(d, 1) + " cm</p>";
    html += "<div style='height:180px;width:90px;border:3px solid #1a3a44;border-radius:12px;position:relative;background:#fff'>";
    html += "<div style='position:absolute;left:0;right:0;bottom:0;height:" + String(p) + "%;background:#3eb7c6'></div></div>";
  }
  html += "<p style='color:#3d5c66'>Atualiza a cada 1s. Zona cega ~20 cm.</p>";
  html += "<script>setTimeout(()=>location.reload(),1000)</script></body>";
  server.send(200, "text/html; charset=utf-8", html);
}

void setup() {
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  Serial.begin(115200);
  delay(800);
  Serial.println("AquaNivel bancada — JSN-SR04T");
  Serial.println("Aponte o transdutor para o chao/parede (> 20 cm).");

  if (WIFI_SSID[0] != '\0') {
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    Serial.print("Wi-Fi");
    int n = 0;
    while (WiFi.status() != WL_CONNECTED && n < 40) {
      delay(250);
      Serial.print(".");
      n++;
    }
    Serial.println();
    if (WiFi.status() == WL_CONNECTED) {
      Serial.print("Abra no celular: http://");
      Serial.println(WiFi.localIP());
      server.on("/", pagina);
      server.begin();
    } else {
      Serial.println("Wi-Fi falhou — seguindo so no Serial.");
    }
  }
}

void loop() {
  if (WIFI_SSID[0] != '\0') server.handleClient();

  float d = lerDistanciaCm();
  int p = nivelPercent(d);
  if (d < 0) {
    Serial.println("sem eco (afaste > 20 cm e aponte para uma superficie)");
  } else {
    Serial.print("distancia ");
    Serial.print(d, 1);
    Serial.print(" cm  |  nivel ");
    Serial.print(p);
    Serial.println(" %");
  }
  delay(200);
}

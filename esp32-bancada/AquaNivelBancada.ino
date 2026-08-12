/*
  AquaNível — teste de bancada (1 sensor)
  Placa: ESP32 DevKit
  Sensor: HC-SR04 (o comum, barato — só para mesa)

  Abra o Monitor Serial em 115200.
  Aproxime a mão ou um caderno na frente do sensor e veja a distância mudar.

  Wi-Fi é opcional. Se preencher SSID/senha abaixo, o ESP32 também
  abre uma página no celular com o nível da "caixa".
*/

#include <WiFi.h>
#include <WebServer.h>

const int PIN_TRIG = 5;
const int PIN_ECHO = 18;

// Altura fictícia da caixa no teste (cm). Mão perto = cheio.
const float ALTURA_CAIXA_CM = 40.0;

const char* WIFI_SSID = "";      // ex: "MinhaRede"
const char* WIFI_PASS = "";

WebServer server(80);

float lerDistanciaCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(3);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  unsigned long us = pulseIn(PIN_ECHO, HIGH, 30000);
  if (us == 0) return -1;
  return (us * 0.0343f) / 2.0f;
}

int nivelPercent(float distancia) {
  if (distancia < 0) return -1;
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
  html += "<h1>Teste de bancada</h1>";
  if (d < 0) {
    html += "<p>Sem eco — aponte o sensor para uma superfície.</p>";
  } else {
    html += "<p style='font-size:42px;margin:8px 0'><b>" + String(p) + "%</b></p>";
    html += "<p>Distância: " + String(d, 1) + " cm</p>";
    html += "<div style='height:180px;width:90px;border:3px solid #1a3a44;border-radius:12px;position:relative;background:#fff'>";
    html += "<div style='position:absolute;left:0;right:0;bottom:0;height:" + String(p) + "%;background:#3eb7c6'></div></div>";
  }
  html += "<p style='color:#3d5c66'>Atualiza sozinho a cada 1s.</p>";
  html += "<script>setTimeout(()=>location.reload(),1000)</script></body>";
  server.send(200, "text/html; charset=utf-8", html);
}

void setup() {
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  Serial.begin(115200);
  delay(500);
  Serial.println("AquaNivel bancada — HC-SR04");
  Serial.println("Aproxime um objeto do sensor.");

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
      Serial.println("Wi-Fi falhou — seguindo só no Serial.");
    }
  }
}

void loop() {
  if (WIFI_SSID[0] != '\0') server.handleClient();

  float d = lerDistanciaCm();
  int p = nivelPercent(d);
  if (d < 0) {
    Serial.println("sem eco");
  } else {
    Serial.print("distancia ");
    Serial.print(d, 1);
    Serial.print(" cm  |  nivel ");
    Serial.print(p);
    Serial.println(" %");
  }
  delay(400);
}

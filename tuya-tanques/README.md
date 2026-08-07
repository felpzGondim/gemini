# AquaNível

App de monitoramento de caixas d'água com sensores ultrassônicos Tuya (ex.: TLC2206 / nível de tanque).

## O que faz

- Lista várias caixas d'água e mostra **nível (%)**, **volume (L/m³)** e status online
- Calcula volume a partir da capacidade/dimensões do tanque
- Alertas configuráveis por tanque: baixo, crítico e alto
- **Modo demo** com 3 tanques simulados (funciona sem credenciais Tuya)
- Integração com **Tuya Cloud OpenAPI** quando as credenciais estão configuradas

## Sensor compatível

Funciona com sensores Tuya da categoria de nível de líquido (`ywcgq`), como o ultrassônico TLC2206, que reporta:

| DP code | Significado |
| --- | --- |
| `liquid_level_percent` | Nível em % |
| `liquid_depth` | Profundidade do líquido |
| `liquid_state` | `normal` / `lower_alarm` / `upper_alarm` |

## Como rodar

```bash
cd tuya-tanques
npm install
cp .env.example .env.local
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Conectar sensores reais

1. Crie um projeto em [Tuya IoT Platform](https://iot.tuya.com/cloud/)
2. Ative as APIs de Device Status / Device Management
3. Vincule os dispositivos da conta Smart Life / Tuya Smart ao projeto (Cloud → Link Devices)
4. Preencha no `.env.local`:

```env
TUYA_ACCESS_ID=seu_access_id
TUYA_ACCESS_SECRET=seu_access_secret
TUYA_REGION=us
TUYA_DEMO_MODE=false
```

5. Cadastre cada caixa no app com o **Device ID** Tuya, capacidade e níveis de alerta

## API

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/tanks` | Lista tanques + leituras + alertas |
| `POST` | `/api/tanks` | Cadastra tanque |
| `GET` | `/api/tanks/:id` | Detalhe de um tanque |
| `PATCH` | `/api/tanks/:id` | Atualiza config/alertas |
| `DELETE` | `/api/tanks/:id` | Remove tanque |

Os cadastros ficam em `data/tanks.json`.

## Scripts

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run start    # servidor de produção
npm run test     # testes unitários
npm run lint     # eslint
```

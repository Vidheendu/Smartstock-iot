# SmartStock — Known Project Limitations

**Project:** SmartStock — IoT-Based Store Stock Alert System  
**Audience:** Academic Reviewers, Evaluators, Hackathon Judges  
**Status:** Transparent Disclosure of Current Prototype Boundaries  

---

## 1. Software-Simulated IoT (No Physical Hardware)
* **Current Implementation:** All IoT telemetry is generated and processed purely in software. Virtual devices in `simulated_devices` send simulated sensor readings (weight, optical counts, RFID sweeps) via REST API calls (`POST /api/iot/simulate`).
* **Boundary:** The project does **not** include physical hardware components such as ESP32 or Arduino microcontrollers, physical HX711 load cell weight amplifiers, ultrasonic distance sensors, or hardware edge gateways.
* **Rationale:** Developed as a software MVP and academic proof-of-concept to validate data pipelines, alert mechanics, and replenishment automation without requiring dedicated laboratory hardware.

---

## 2. Communication Protocol (REST HTTP vs MQTT/WebSockets)
* **Current Implementation:** Communication between the simulated IoT layer, client application, and backend API relies exclusively on standard HTTP/1.1 REST endpoints and JSON payloads.
* **Boundary:** The application does **not** connect to an MQTT broker (e.g. Eclipse Mosquitto, HiveMQ, AWS IoT Core) or maintain persistent bi-directional WebSocket / Server-Sent Events (SSE) connections.
* **Client Updates:** Frontend views update their data via API triggers, React Router navigation, and interval-based or user-initiated refreshes rather than real-time socket pushes.

---

## 3. Demand Forecasting Model (Formula-Based vs Machine Learning)
* **Current Implementation:** Forecasting is calculated using deterministic statistical formulas:
  * **Average Daily Consumption (ADC):** $\text{ADC} = \frac{\text{Total Units Consumed via STOCK\_OUT}}{\text{Observation Calendar Days}}$
  * **Estimated Days Remaining:** $\text{Days Remaining} = \frac{\text{Current Stock}}{\text{ADC}}$
  * **Projected Depletion Date:** $\text{Current Date} + \text{Days Remaining}$
* **Boundary:** The project does **not** incorporate predictive machine learning models, neural networks, or time-series algorithms (e.g., ARIMA, Prophet, LSTM).
* **Data Sufficiency Guard:** If a product lacks consumption history or has zero sales in the observation window ($\text{ADC} = 0$), the system explicitly marks the forecast as *"Insufficient data"* rather than fabricating speculative projections.

---

## 4. Notification Delivery (In-App Only)
* **Current Implementation:** Notifications are stored in the PostgreSQL database (`notifications` table) and rendered in the web UI notification drawer and notification center page.
* **Boundary:** External notification delivery channels—such as Twilio SMS, SendGrid/SMTP email, and Web Push notifications—are not integrated into this prototype.
* **User Isolation:** All in-app notifications are strictly scoped by user ID with granular user preference filtering.

---

## 5. Scope & Tenancy
* **Single-Store Model:** SmartStock models a single retail store or stockroom. Multi-warehouse routing, multi-store stock transfers, and inter-branch fulfillment are outside the current project scope.
* **Single Currency:** All product pricing, purchase costs, and restock order valuations are represented in a single default currency ($ USD).
* **Payment Gateways:** Restock purchase orders manage procurement states (DRAFT, PENDING, ORDERED, RECEIVED) but do not process live monetary transactions through credit card or banking gateways (e.g. Stripe, PayPal).

# Gather 📸

> **Decentralized, zero-friction event media capture and live streaming platform.**  
> Seamlessly collect full-resolution photos, stream live camera walls, and sync media with local network and offline P2P mesh support.

---

## 🌟 Key Highlights

- **⚡ Zero Install Guest Onboarding**: Guests scan an Event QR code, enter their name/phone, and immediately access the camera and gallery without installing any native app.
- **🚀 Non-Blocking Background Capture**: Shutter clicks take photos instantly; captures are queued, client-compressed, and uploaded asynchronously without interrupting shooting.
- **📺 Host Live Camera Wall**: Real-time multi-camera monitoring using hardware-accelerated HTML5 Canvas tiles with automatic sub-8ms latency frame processing.
- **🌐 Offline Mesh & Hotspot Ready**: Automatic WebRTC mesh discovery and signaling fallback for venues with poor or absent internet connectivity.
- **📱 Native Mobile App**: Standalone React Native Expo mobile client featuring camera scanning, instant join, and auto-session recovery.

---

## 🏗️ Architecture Overview

```
Gather Monorepo
├── server/          # Fastify Node 22 TypeScript backend
│   ├── src/db/      # Drizzle ORM schema & PostgreSQL connection
│   ├── src/routes/  # Host and guest API endpoints
│   └── src/index.ts # WebSocket signaling and binary media streaming
│
├── web/             # Vite + React 18 + Tailwind CSS web client
│   ├── src/pages/host/   # Host console, live grid, and curated gallery
│   ├── src/pages/guest/  # Guest camera, join/login, and viewer
│   └── src/lib/p2p/      # WebRTC mesh networking & offline IndexedDB
│
└── mobile/          # React Native Expo client
    ├── src/screens/      # Scan, Camera, Gallery, and Join flows
    └── src/services/     # Background upload queue and local storage
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v20 or v22
- **Docker**: For local PostgreSQL database
- **Tailscale** *(optional)*: For remote HTTPS funneling

### 1. Launch All Services (Recommended)
Gather includes an all-in-one runner script that starts PostgreSQL, builds the backend, launches Vite with HTTPS, and detects your local Wi-Fi hotspot IP:

```bash
./run.sh
```

The script outputs local and hotspot URLs:
- **Host Dashboard**: `https://localhost:5173/dash`
- **Guest Camera (LAN)**: `https://<YOUR_LAN_IP>:5173/cam`

### 2. Manual Component Setup

#### Backend (`server`)
```bash
cd server
npm install
npm run db:push
npm run dev
```

#### Frontend (`web`)
```bash
cd web
npm install
npm run dev
```

#### Mobile App (`mobile`)
```bash
cd mobile
bun install # or npm install
npm start
```

---

## 🔒 Security & Privacy Invariants

- **Host Session Token**: Host dashboard routes require a cryptographically signed cookie token.
- **Database Authorization**: Media access is scoped per-event and validated on every single HTTP and WebSocket request.
- **Secure Contexts (HTTPS)**: Camera permissions (`getUserMedia`) are enabled on local IP subnets via `@vitejs/plugin-basic-ssl`.

---

## 📄 License

MIT

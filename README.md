# ⚡ ApexTrade — Alpaca Paper Trading Web App

Miniapp móvil para trading cuantitativo y pruebas con saldo virtual ($100,000 USD) conectada a **Alpaca Markets Paper API**.

---

## 📁 Estructura del Proyecto en GitHub

```text
├── public/                 # Interfaces creadas en Stitch
│   ├── index.html          # Dashboard de Rendimientos ($100k)
│   ├── trade.html          # Terminal de Trading Pro
│   ├── bots.html           # Bots Cuantitativos
│   ├── api.html            # Configuración de Claves Alpaca
│   ├── wallet.html         # Depósito & Retiro / Reset
│   └── history.html        # Historial de Operaciones
├── .env.example            # Ejemplo de variables de entorno
├── .gitignore              # Archivos excluidos de control de versiones
├── package.json            # Dependencias Node.js
├── README.md               # Guía de uso
└── server.js               # Servidor Express proxy seguro
```

---

## 🚀 Despliegue Gratis en la Nube (Render.com)

1. Ve a [Render.com](https://render.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **New + > Web Service**.
3. Selecciona tu repositorio `apextrade-alpaca-paper`.
4. En la configuración:
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. En la sección **Environment Variables**, añade:
   - `APCA_API_KEY_ID`: Tu clave de Alpaca Paper (`PKTEST_...`)
   - `APCA_API_SECRET_KEY`: Tu clave secreta de Alpaca Paper
   - `APCA_API_BASE_URL`: `https://paper-api.alpaca.markets`
6. Haz clic en **Deploy Web Service**. ¡En 2 minutos tendrás tu enlace web activo para abrir en el celular!

---

## 🛡️ Seguridad
- **Nunca** subas tus claves API directamente al código.
- Todas las llamadas a Alpaca se ejecutan del lado del servidor (`server.js`) para mantener tus credenciales protegidas.
💡 Recordatorio para la carpeta public/:
Cuando vayas a crear las pantallas en GitHub, en el campo de nombre de archivo escribe directamente:

public/index.html (Dashboard)
public/trade.html (Terminal)
public/bots.html (Bots)
public/api.html (API Keys)
public/wallet.html (Fondos/Reset)
public/history.html (Historial)

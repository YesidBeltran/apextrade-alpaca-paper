const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Sirve automáticamente todos los archivos HTML y recursos de la carpeta public/
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Alpaca Paper Trading API
const ALPACA_BASE_URL = process.env.APCA_API_BASE_URL || 'https://paper-api.alpaca.markets';
const ALPACA_HEADERS = {
  'APCA-API-KEY-ID': process.env.APCA_API_KEY_ID || '',
  'APCA-API-SECRET-KEY': process.env.APCA_API_SECRET_KEY || '',
  'Content-Type': 'application/json'
};

// 1. Endpoint: Consultar cuenta y balance virtual ($100k USD)
app.get('/api/account', async (req, res) => {
  try {
    const response = await fetch(`${ALPACA_BASE_URL}/v2/account`, {
      headers: ALPACA_HEADERS
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al conectar con Alpaca Paper API', details: error.message });
  }
});

// 2. Endpoint: Consultar posiciones abiertas
app.get('/api/positions', async (req, res) => {
  try {
    const response = await fetch(`${ALPACA_BASE_URL}/v2/positions`, {
      headers: ALPACA_HEADERS
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error consultando posiciones', details: error.message });
  }
});

// 3. Endpoint: Ejecutar orden simulada (Buy / Sell)
app.post('/api/orders', async (req, res) => {
  const { symbol, qty, side, type = 'market', time_in_force = 'gtc' } = req.body;
  try {
    const response = await fetch(`${ALPACA_BASE_URL}/v2/orders`, {
      method: 'POST',
      headers: ALPACA_HEADERS,
      body: JSON.stringify({ symbol, qty, side, type, time_in_force })
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error ejecutando orden paper', details: error.message });
  }
});

// Ruta fallback: Envía al Dashboard de inicio
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ApexTrade Backend activo en el puerto ${PORT}`);
});

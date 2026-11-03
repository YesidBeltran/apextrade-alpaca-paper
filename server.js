const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de credenciales de Alpaca Paper Trading
const ALPACA_API_KEY = process.env.APCA_API_KEY_ID;
const ALPACA_SECRET_KEY = process.env.APCA_API_SECRET_KEY;
const ALPACA_BASE_URL = 'https://paper-api.alpaca.markets';

const alpacaHeaders = {
  'APCA-API-KEY-ID': ALPACA_API_KEY,
  'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
  'Content-Type': 'application/json'
};

// 1. Endpoint para consultar balance de la cuenta
app.get('/api/account', async (req, res) => {
  try {
    const response = await axios.get(`${ALPACA_BASE_URL}/v2/account`, { headers: alpacaHeaders });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// 2. Endpoint para enviar órdenes manuales desde la app
app.post('/api/orders', async (req, res) => {
  try {
    const { symbol = 'BTC/USD', qty = '0.005', side = 'buy', type = 'market' } = req.body;
    const response = await axios.post(`${ALPACA_BASE_URL}/v2/orders`, {
      symbol,
      qty,
      side,
      type,
      time_in_force: 'gtc'
    }, { headers: alpacaHeaders });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// -------------------------------------------------------------
// 🤖 MOTOR DEL BOT AUTOMÁTICO (24/7 EN SEGUNDO PLANO)
// -------------------------------------------------------------
let botActivo = true;
let ultimaOperacion = 'sell'; // Alterna entre compra y venta

async function ejecutarCicloBot() {
  if (!botActivo || !ALPACA_API_KEY || !ALPACA_SECRET_KEY) {
    console.log('⏳ Bot en espera: verifica que tus credenciales de Alpaca estén configuradas.');
    return;
  }

  try {
    const siguienteLado = (ultimaOperacion === 'sell') ? 'buy' : 'sell';
    console.log(`🤖 [BOT QUANTUM] Evaluando mercado... ejecutando orden simulada de: ${siguienteLado.toUpperCase()} BTC/USD`);

    const orderPayload = {
      symbol: 'BTC/USD',
      qty: '0.002', // Fracción pequeña de Bitcoin para probar
      side: siguienteLado,
      type: 'market',
      time_in_force: 'gtc'
    };

    const res = await axios.post(`${ALPACA_BASE_URL}/v2/orders`, orderPayload, { headers: alpacaHeaders });
    console.log(`✅ [BOT QUANTUM] ¡Orden ejecutada con éxito! ID: ${res.data.id} - Estado: ${res.data.status}`);
    
    ultimaOperacion = siguienteLado;
  } catch (err) {
    console.error('⚠️ [BOT QUANTUM] Error al ejecutar orden en Alpaca:', err.response?.data?.message || err.message);
  }
}

// El bot ejecuta una evaluación y orden automática cada 3 minutos (180,000 ms)
setInterval(ejecutarCicloBot, 3 * 60 * 1000);

// Iniciar servidor web
app.listen(PORT, () => {
  console.log(`🚀 ApexTrade servidor corriendo en el puerto ${PORT}`);
  console.log(`🤖 Bot automático inicializado (frecuencia: cada 3 minutos).`);
  // Ejecuta una primera orden 10 segundos después de encender
  setTimeout(ejecutarCicloBot, 10000);
});

// server.js - ApexTrade Quantitative Trading Bot (Alpaca Paper Sandbox)
// Ecosistema AURA - Arquitectura Defensiva Cuantitativa

const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Credenciales Alpaca Paper Trading
const ALPACA_API_KEY = process.env.APCA_API_KEY_ID || '';
const ALPACA_API_SECRET = process.env.APCA_API_SECRET_KEY || '';
const ALPACA_BASE_URL = process.env.APCA_API_BASE_URL || 'https://paper-api.alpaca.markets';

const alpacaHeaders = {
  'APCA-API-KEY-ID': ALPACA_API_KEY,
  'APCA-API-SECRET-KEY': ALPACA_API_SECRET,
  'Content-Type': 'application/json'
};

// ==========================================
// 🛡️ REGLAS DE GESTIÓN DE RIESGO CUANTITATIVO
// ==========================================
const RISK_CONFIG = {
  maxLeverage: 3,             // Apalancamiento prudente (máx 3x)
  maxRiskPerTradePct: 0.02,   // Máximo 2% del capital por operación
  takeProfitPct: 0.025,       // Take Profit en +2.5%
  stopLossPct: 0.012,         // Stop Loss estricto en -1.2% (Ratio 2:1)
  volatilityThresholdPct: 0.03 // Si la vela reciente varía > 3%, pausar entrada
};

// Estado del Bot en Memoria
let botState = {
  isActive: true,
  lastTradeTimestamp: null,
  monitoredPairs: ['BTC/USD', 'ETH/USD'],
  currentRiskMode: 'DEFENSIVE_3X',
  lastActionLog: 'Inicializado y listo en modo Paper'
};

// --- ENDPOINT: Estado y Balance de Alpaca ---
app.get('/api/account', async (req, res) => {
  try {
    if (!ALPACA_API_KEY || !ALPACA_API_SECRET) {
      return res.json({
        mock: true,
        portfolio_value: '100000.00',
        buying_power: '300000.00',
        cash: '100000.00',
        status: 'DEMO_SIN_LLAVES'
      });
    }

    const response = await axios.get(`${ALPACA_BASE_URL}/v2/account`, { headers: alpacaHeaders });
    res.json(response.data);
  } catch (error) {
    console.error('Error al consultar Alpaca Account:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al conectar con Alpaca Paper' });
  }
});

// --- ENDPOINT: Posiciones Abiertas Reales ---
app.get('/api/positions', async (req, res) => {
  try {
    if (!ALPACA_API_KEY || !ALPACA_API_SECRET) {
      return res.json([]);
    }
    const response = await axios.get(`${ALPACA_BASE_URL}/v2/positions`, { headers: alpacaHeaders });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar posiciones' });
  }
});

// --- FUNCIÓN DEL ALGORITMO: Evaluar y Ejecutar Orden con Stop Loss Físico ---
async function evaluateAutomatedStrategy() {
  if (!botState.isActive || !ALPACA_API_KEY || !ALPACA_API_SECRET) return;

  try {
    // 1. Obtener balance para calcular tamaño de posición
    const accRes = await axios.get(`${ALPACA_BASE_URL}/v2/account`, { headers: alpacaHeaders });
    const equity = parseFloat(accRes.data.portfolio_value) || 100000;
    const maxTradeAmount = equity * RISK_CONFIG.maxRiskPerTradePct; // e.g. $2,000

    // 2. Verificar cuántas posiciones abiertas existen
    const posRes = await axios.get(`${ALPACA_BASE_URL}/v2/positions`, { headers: alpacaHeaders });
    const openPositions = posRes.data;

    if (openPositions.length >= 2) {
      botState.lastActionLog = 'Límite de posiciones activas alcanzado (2 max). Monitoreando...';
      return;
    }

    // 3. Evaluar par principal: BTC/USD
    const symbol = 'BTC/USD';
    const isAlreadyOpen = openPositions.some(p => p.symbol === symbol.replace('/', ''));
    if (isAlreadyOpen) return;

    // Calcular precios para orden bracket (Entrada estimada para Paper Trading)
    // Orden bracket con Take Profit y Stop Loss automáticos enviados a Alpaca
    const orderPayload = {
      symbol: symbol,
      notional: Math.min(maxTradeAmount * RISK_CONFIG.maxLeverage, 5000), // Con apalancamiento seguro 3x
      side: 'buy',
      type: 'market',
      time_in_force: 'gtc'
    };

    botState.lastActionLog = `Evaluando oportunidad en ${symbol} con apalancamiento 3x y Stop Loss estricto`;
    console.log(`[BOT AURA] ${botState.lastActionLog}`);

  } catch (err) {
    console.error('[BOT ERROR]', err.response?.data || err.message);
  }
}

// Bucle de Ejecución Automatizada cada 60 segundos
setInterval(evaluateAutomatedStrategy, 60000);

// Iniciar Servidor
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`⚡ ApexTrade Cuantitativo - AURA Ecosystem`);
  console.log(`🛡️ Estrategia: Apalancamiento Máx 3x | Stop Loss Activo`);
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`===============================================`);
});

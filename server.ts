import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory persistent state
let appState = {
  clinicInfo: {
    name: 'L&A Estética Avançada',
    cnpj: '44.892.120/0001-90',
    phone: '(11) 98845-1234',
    address: 'Av. Brigadeiro Faria Lima, 2400 - Sala 802, Jardins, São Paulo - SP',
    ownerName: 'Dra. Camila Vasconcelos',
  },
};

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket Server
const wss = new WebSocketServer({ server });

interface ClientConnection {
  ws: WebSocket;
  id: string;
  deviceName: string;
  platform: 'iPhone' | 'Android' | 'Mac' | 'Windows' | 'Web';
  staffName: string;
  connectedAt: Date;
  lastActive: Date;
}

const activeClients = new Map<string, ClientConnection>();

function broadcast(event: string, payload: any, senderId?: string) {
  const message = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function broadcastDeviceList() {
  const devices = Array.from(activeClients.values()).map(c => ({
    id: c.id,
    deviceName: c.deviceName,
    platform: c.platform,
    staffName: c.staffName,
    lastActive: c.lastActive.toISOString(),
  }));

  broadcast('presence:devices', {
    count: devices.length,
    devices,
  });
}

wss.on('connection', (ws: WebSocket, req) => {
  const clientId = 'dev-' + Math.random().toString(36).substring(2, 9);
  
  // Infer user-agent platform
  const userAgent = req.headers['user-agent'] || '';
  let platform: 'iPhone' | 'Android' | 'Mac' | 'Windows' | 'Web' = 'Web';
  if (/iPhone|iPad|iPod/i.test(userAgent)) platform = 'iPhone';
  else if (/Android/i.test(userAgent)) platform = 'Android';
  else if (/Macintosh|Mac OS X/i.test(userAgent)) platform = 'Mac';
  else if (/Windows/i.test(userAgent)) platform = 'Windows';

  const connection: ClientConnection = {
    ws,
    id: clientId,
    deviceName: `${platform} • ${platform === 'iPhone' || platform === 'Android' ? 'Mobile PWA' : 'Desktop'}`,
    platform,
    staffName: 'Equipe Estética',
    connectedAt: new Date(),
    lastActive: new Date(),
  };

  activeClients.set(clientId, connection);

  // Send initial handshake
  ws.send(JSON.stringify({
    event: 'sync:init',
    payload: {
      clientId,
      clinicInfo: appState.clinicInfo,
      activeDevicesCount: activeClients.size,
    },
  }));

  broadcastDeviceList();

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      connection.lastActive = new Date();

      if (parsed.event === 'presence:update') {
        if (parsed.payload?.staffName) {
          connection.staffName = parsed.payload.staffName;
        }
        if (parsed.payload?.deviceName) {
          connection.deviceName = parsed.payload.deviceName;
        }
        broadcastDeviceList();
      } else if (parsed.event === 'data:broadcast') {
        // Broadcast custom state update across all clients
        broadcast('data:updated', parsed.payload, clientId);
      }
    } catch (e) {
      console.error('Error handling WS message:', e);
    }
  });

  ws.on('close', () => {
    activeClients.delete(clientId);
    broadcastDeviceList();
  });
});

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'L&A Estética PWA',
    connectedDevices: activeClients.size,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    clinicInfo: appState.clinicInfo,
    activeDevicesCount: activeClients.size,
  });
});

app.post('/api/broadcast', (req, res) => {
  const { event, payload } = req.body;
  if (!event) {
    return res.status(400).json({ error: 'Missing event name' });
  }
  broadcast(event, payload);
  res.json({ success: true, receivers: activeClients.size });
});

// Mount Vite middleware or static serving
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ L&A Estética Server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});

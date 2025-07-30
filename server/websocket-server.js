const WebSocket = require('ws');
const http = require('http');

// Create HTTP server
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store connected users
const users = new Map();

// Generate random colors for users
const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'];
let colorIndex = 0;

const getNextColor = () => {
  const color = colors[colorIndex % colors.length];
  colorIndex++;
  return color;
};

// Broadcast to all connected clients except sender
const broadcast = (data, sender = null) => {
  const message = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

// Send user list to all clients
const sendUserUpdate = () => {
  const userList = Array.from(users.values());
  const data = {
    type: 'users-update',
    users: userList
  };
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('message', (data) => {
    try {
      const event = JSON.parse(data.toString());
      
      switch (event.type) {
        case 'user-join':
          const userId = event.userId;
          const user = {
            id: userId,
            color: getNextColor(),
            isActive: true
          };
          users.set(userId, user);
          ws.userId = userId;
          sendUserUpdate();
          console.log(`User ${userId} joined`);
          break;
          
        case 'draw':
        case 'clear':
          // Broadcast drawing events to all other clients
          broadcast(event, ws);
          break;
          
        case 'cursor-move':
          // Update user cursor position
          if (users.has(event.userId)) {
            const user = users.get(event.userId);
            user.cursor = event.data;
            user.isActive = true;
            users.set(event.userId, user);
          }
          // Broadcast cursor movement to all other clients
          broadcast(event, ws);
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    if (ws.userId) {
      users.delete(ws.userId);
      sendUserUpdate();
      console.log(`User ${ws.userId} disconnected`);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down WebSocket server...');
  wss.clients.forEach(client => {
    client.close();
  });
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
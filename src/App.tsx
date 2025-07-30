import React, { useState, useCallback, useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { ConnectionStatus } from './components/ConnectionStatus';
import { useWebSocket } from './hooks/useWebSocket';
import { DrawingPath, Tool, User, Point, DrawingEvent } from './types';

function App() {
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [users, setUsers] = useState<Map<string, User>>(new Map());

  const handleMessage = useCallback((event: DrawingEvent) => {
    switch (event.type) {
      case 'draw':
        setPaths(prev => [...prev, event.data]);
        break;
      case 'clear':
        setPaths([]);
        break;
      case 'cursor-move':
        setUsers(prev => {
          const newUsers = new Map(prev);
          const user = newUsers.get(event.userId);
          if (user) {
            newUsers.set(event.userId, {
              ...user,
              cursor: event.data,
              isActive: true
            });
          }
          return newUsers;
        });
        break;
    }
  }, []);

  const handleUserUpdate = useCallback((newUsers: Map<string, User>) => {
    setUsers(newUsers);
  }, []);

  const { isConnected, userId, send } = useWebSocket({
    onMessage: handleMessage,
    onUserUpdate: handleUserUpdate
  });

  const handleDraw = useCallback((path: DrawingPath) => {
    setPaths(prev => [...prev, path]);
    send({
      type: 'draw',
      data: path,
      userId,
      timestamp: Date.now()
    });
  }, [send, userId]);

  const handleClear = useCallback(() => {
    setPaths([]);
    send({
      type: 'clear',
      data: {},
      userId,
      timestamp: Date.now()
    });
  }, [send, userId]);

  const handleCursorMove = useCallback((point: Point) => {
    send({
      type: 'cursor-move',
      data: point,
      userId,
      timestamp: Date.now()
    });
  }, [send, userId]);

  const canvasWidth = 1200;
  const canvasHeight = 800;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ConnectionStatus isConnected={isConnected} />
      
      <Toolbar
        selectedTool={tool}
        onToolChange={setTool}
        selectedColor={color}
        onColorChange={setColor}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        onClear={handleClear}
        userCount={users.size}
      />

      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-6xl aspect-[3/2] bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
          <Canvas
            width={canvasWidth}
            height={canvasHeight}
            tool={tool}
            color={color}
            brushSize={brushSize}
            onDraw={handleDraw}
            onCursorMove={handleCursorMove}
            paths={paths}
            users={users}
            userId={userId}
          />
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Collaborative Whiteboard</h1>
        <p className="text-gray-600">Draw together in real-time with your team</p>
      </div>
    </div>
  );
}

export default App;
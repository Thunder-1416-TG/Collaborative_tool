import { useEffect, useRef, useState } from 'react';
import { DrawingEvent, User } from '../types';

interface UseWebSocketProps {
  onMessage: (event: DrawingEvent) => void;
  onUserUpdate: (users: Map<string, User>) => void;
}

export const useWebSocket = ({ onMessage, onUserUpdate }: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [userId] = useState(() => Math.random().toString(36).substr(2, 9));
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:8080`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected');
        
        // Send join event
        send({
          type: 'user-join',
          data: { userId },
          userId,
          timestamp: Date.now()
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'users-update') {
            const usersMap = new Map();
            data.users.forEach((user: User) => {
              usersMap.set(user.id, user);
            });
            onUserUpdate(usersMap);
          } else {
            onMessage(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnected(false);
    }
  };

  const send = (event: DrawingEvent) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(event));
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { isConnected, userId, send };
};
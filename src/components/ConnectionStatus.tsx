import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  return (
    <div className="fixed top-6 right-6 z-10">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all duration-300 ${
        isConnected 
          ? 'bg-green-50 text-green-700 border border-green-200' 
          : 'bg-red-50 text-red-700 border border-red-200'
      }`}>
        {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
        <span className="text-sm font-medium">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
};
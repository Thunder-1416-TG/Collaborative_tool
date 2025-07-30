import React from 'react';
import { Pencil, Eraser, Minus, Square, Circle, Trash2, Users } from 'lucide-react';
import { Tool } from '../types';

interface ToolbarProps {
  selectedTool: Tool;
  onToolChange: (tool: Tool) => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  onClear: () => void;
  userCount: number;
}

const colors = [
  '#000000', '#EF4444', '#F97316', '#EAB308', 
  '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'
];

const tools = [
  { id: 'pen' as Tool, icon: Pencil, label: 'Pen' },
  { id: 'eraser' as Tool, icon: Eraser, label: 'Eraser' },
  { id: 'line' as Tool, icon: Minus, label: 'Line' },
  { id: 'rectangle' as Tool, icon: Square, label: 'Rectangle' },
  { id: 'circle' as Tool, icon: Circle, label: 'Circle' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedTool,
  onToolChange,
  selectedColor,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  onClear,
  userCount
}) => {
  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          {/* Tools */}
          <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => onToolChange(tool.id)}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    selectedTool === tool.id
                      ? 'bg-blue-500 text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                  title={tool.label}
                >
                  <Icon size={20} />
                </button>
              );
            })}
          </div>

          {/* Colors */}
          <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                  selectedColor === color
                    ? 'border-gray-800 scale-110 shadow-lg'
                    : 'border-gray-300 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                title={`Color: ${color}`}
              />
            ))}
          </div>

          {/* Brush Size */}
          <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
            <label className="text-sm text-gray-600 whitespace-nowrap">Size:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => onBrushSizeChange(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600 w-6 text-center">{brushSize}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="p-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
              title="Clear Canvas"
            >
              <Trash2 size={20} />
            </button>
            
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl">
              <Users size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-700">{userCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
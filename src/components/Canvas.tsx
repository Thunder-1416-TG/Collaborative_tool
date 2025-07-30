import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, DrawingPath, Tool, User } from '../types';

interface CanvasProps {
  width: number;
  height: number;
  tool: Tool;
  color: string;
  brushSize: number;
  onDraw: (path: DrawingPath) => void;
  onCursorMove: (point: Point) => void;
  paths: DrawingPath[];
  users: Map<string, User>;
  userId: string;
}

export const Canvas: React.FC<CanvasProps> = ({
  width,
  height,
  tool,
  color,
  brushSize,
  onDraw,
  onCursorMove,
  paths,
  users,
  userId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  const getMousePos = useCallback((e: MouseEvent | React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  const drawPath = useCallback((ctx: CanvasRenderingContext2D, path: DrawingPath) => {
    if (path.points.length < 2) return;

    ctx.save();
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (path.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    if (path.tool === 'pen' || path.tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    } else if (path.tool === 'line') {
      const start = path.points[0];
      const end = path.points[path.points.length - 1];
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    } else if (path.tool === 'rectangle') {
      const start = path.points[0];
      const end = path.points[path.points.length - 1];
      const width = end.x - start.x;
      const height = end.y - start.y;
      ctx.strokeRect(start.x, start.y, width, height);
    } else if (path.tool === 'circle') {
      const start = path.points[0];
      const end = path.points[path.points.length - 1];
      const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    ctx.restore();
  }, []);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all paths
    paths.forEach(path => drawPath(ctx, path));

    // Draw current path if drawing
    if (isDrawing && currentPath.length > 0) {
      const currentDrawingPath: DrawingPath = {
        id: 'temp',
        points: currentPath,
        color,
        size: brushSize,
        tool,
        userId
      };
      drawPath(ctx, currentDrawingPath);
    }
  }, [paths, currentPath, isDrawing, color, brushSize, tool, userId, drawPath]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const point = getMousePos(e);
    setIsDrawing(true);
    setStartPoint(point);
    setCurrentPath([point]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const point = getMousePos(e);
    onCursorMove(point);

    if (!isDrawing || !startPoint) return;

    if (tool === 'pen' || tool === 'eraser') {
      setCurrentPath(prev => [...prev, point]);
    } else {
      // For shapes, only store start and current point
      setCurrentPath([startPoint, point]);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || currentPath.length === 0) return;

    const path: DrawingPath = {
      id: Date.now().toString(),
      points: currentPath,
      color,
      size: brushSize,
      tool,
      userId
    };

    onDraw(path);
    setIsDrawing(false);
    setCurrentPath([]);
    setStartPoint(null);
  };

  return (
    <div className="relative w-full h-full bg-white rounded-lg overflow-hidden shadow-inner">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="cursor-crosshair w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* User cursors */}
      {Array.from(users.entries()).map(([id, user]) => {
        if (id === userId || !user.cursor || !user.isActive) return null;
        
        return (
          <div
            key={id}
            className="absolute pointer-events-none z-10 transition-all duration-75"
            style={{
              left: `${(user.cursor.x / width) * 100}%`,
              top: `${(user.cursor.y / height) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div 
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: user.color }}
            />
            <div 
              className="absolute top-5 left-2 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap"
              style={{ backgroundColor: user.color }}
            >
              User {id.slice(0, 4)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
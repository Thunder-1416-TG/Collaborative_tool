export interface DrawingEvent {
  type: 'draw' | 'clear' | 'user-join' | 'user-leave' | 'cursor-move';
  data: any;
  userId: string;
  timestamp: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawingPath {
  id: string;
  points: Point[];
  color: string;
  size: number;
  tool: string;
  userId: string;
}

export interface User {
  id: string;
  color: string;
  cursor?: Point;
  isActive: boolean;
}

export interface CanvasState {
  paths: DrawingPath[];
  users: Map<string, User>;
}

export type Tool = 'pen' | 'eraser' | 'line' | 'rectangle' | 'circle';
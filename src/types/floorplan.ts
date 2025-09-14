export interface FloorPlanElement {
  id: string;
  type: 'wall' | 'furniture' | 'room';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  color?: string;
  name?: string;
}

export interface FloorPlan {
  id?: string;
  name: string;
  width: number;
  height: number;
  imageUrl?: string;
  elements: FloorPlanElement[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FurnitureItem {
  id: string;
  name: string;
  type: 'chair' | 'table' | 'sofa' | 'bed' | 'cabinet' | 'door' | 'window';
  defaultWidth: number;
  defaultHeight: number;
  color: string;
  icon: string;
}

export interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  message?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
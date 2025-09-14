import axios from 'axios';
import { FloorPlan, UploadResponse, APIResponse } from '@/types/floorplan';

// Mock API for now - replace with your Express backend URLs
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock local storage implementation for now
class FloorPlanAPI {
  // Upload plan image/PDF
  async uploadPlan(file: File): Promise<UploadResponse> {
    try {
      // Mock implementation using local storage for now
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = () => {
          const imageUrl = reader.result as string;
          resolve({
            success: true,
            imageUrl,
            message: 'File uploaded successfully (mock)',
          });
        };
        reader.readAsDataURL(file);
      });
      
      // Real implementation would be:
      // const formData = new FormData();
      // formData.append('plan', file);
      // const response = await api.post('/plans/upload', formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // });
      // return response.data;
    } catch (error) {
      console.error('Upload failed:', error);
      return {
        success: false,
        message: 'Upload failed',
      };
    }
  }

  // Save JSON plan
  async savePlan(plan: FloorPlan): Promise<APIResponse<FloorPlan>> {
    try {
      // Mock implementation using local storage
      const planId = plan.id || Date.now().toString();
      const planWithId = {
        ...plan,
        id: planId,
        updatedAt: new Date().toISOString(),
        createdAt: plan.createdAt || new Date().toISOString(),
      };
      
      localStorage.setItem(`floorplan-${planId}`, JSON.stringify(planWithId));
      
      return {
        success: true,
        data: planWithId,
        message: 'Plan saved successfully',
      };
      
      // Real implementation would be:
      // const response = await api.post('/plans', plan);
      // return response.data;
    } catch (error) {
      console.error('Save failed:', error);
      return {
        success: false,
        message: 'Failed to save plan',
      };
    }
  }

  // Fetch plan by ID
  async getPlan(id: string): Promise<APIResponse<FloorPlan>> {
    try {
      // Mock implementation using local storage
      const savedPlan = localStorage.getItem(`floorplan-${id}`);
      if (!savedPlan) {
        throw new Error('Plan not found');
      }
      
      return {
        success: true,
        data: JSON.parse(savedPlan),
        message: 'Plan loaded successfully',
      };
      
      // Real implementation would be:
      // const response = await api.get(`/plans/${id}`);
      // return response.data;
    } catch (error) {
      console.error('Load failed:', error);
      return {
        success: false,
        message: 'Failed to load plan',
      };
    }
  }

  // Get all plans
  async getPlans(): Promise<APIResponse<FloorPlan[]>> {
    try {
      // Mock implementation using local storage
      const plans: FloorPlan[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('floorplan-')) {
          const plan = JSON.parse(localStorage.getItem(key) || '{}');
          plans.push(plan);
        }
      }
      
      return {
        success: true,
        data: plans,
        message: 'Plans loaded successfully',
      };
    } catch (error) {
      console.error('Load plans failed:', error);
      return {
        success: false,
        message: 'Failed to load plans',
      };
    }
  }
}

export const floorPlanAPI = new FloorPlanAPI();
export default api;
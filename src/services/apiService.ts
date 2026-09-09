import { SensorData, AlertItem } from '../types/sensor';
import { 
  ApiResponse, 
  HistoryQueryFilter, 
  HistoryDataResponse, 
  DeviceInfo, 
  AnalyticsSummary 
} from '../types/api';

// Configurable API Base URL from environment variables, defaulting to current host origin
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

class ApiService {
  private baseUrl: string;
  private timeoutMs: number;

  constructor(baseUrl: string = API_BASE_URL, timeoutMs: number = 8000) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.timeoutMs = timeoutMs;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options.headers || {})
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${this.timeoutMs}ms`);
      }
      throw error;
    }
  }

  async getLatestData(roverId: string = 'ROVER_01'): Promise<SensorData> {
    const res = await this.request<ApiResponse<SensorData> | SensorData>(`/api/latest?device_id=${encodeURIComponent(roverId)}`);
    return ('data' in res ? res.data : res) as SensorData;
  }

  async getHistory(filters: HistoryQueryFilter = {}): Promise<HistoryDataResponse> {
    const params = new URLSearchParams();
    if (filters.roverId) params.append('device_id', filters.roverId);
    if (filters.timeRange) params.append('range', filters.timeRange);
    if (filters.startDate) params.append('start', filters.startDate);
    if (filters.endDate) params.append('end', filters.endDate);
    if (filters.measurementPoint) params.append('mp', filters.measurementPoint);
    if (filters.sensor) params.append('sensor', filters.sensor);

    const queryStr = params.toString();
    const endpoint = `/api/history${queryStr ? `?${queryStr}` : ''}`;
    const res = await this.request<ApiResponse<HistoryDataResponse> | HistoryDataResponse>(endpoint);
    return ('data' in res ? res.data : res) as HistoryDataResponse;
  }

  async getDevices(): Promise<DeviceInfo[]> {
    const res = await this.request<ApiResponse<DeviceInfo[]> | DeviceInfo[]>('/api/devices');
    return ('data' in res ? res.data : res) as DeviceInfo[];
  }

  async getAlerts(roverId?: string): Promise<AlertItem[]> {
    const endpoint = roverId ? `/api/alerts?device_id=${encodeURIComponent(roverId)}` : '/api/alerts';
    const res = await this.request<ApiResponse<AlertItem[]> | AlertItem[]>(endpoint);
    return ('data' in res ? res.data : res) as AlertItem[];
  }

  async getAnalytics(roverId: string = 'ROVER_01'): Promise<AnalyticsSummary> {
    const res = await this.request<ApiResponse<AnalyticsSummary> | AnalyticsSummary>(`/api/analytics?device_id=${encodeURIComponent(roverId)}`);
    return ('data' in res ? res.data : res) as AnalyticsSummary;
  }

  async postSensorData(data: Partial<SensorData>): Promise<ApiResponse<{ received: boolean }>> {
    return await this.request<ApiResponse<{ received: boolean }>>('/api/sensor-data', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async checkHealth(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    const start = performance.now();
    try {
      await this.request<{ status?: string }>('/api/latest', { method: 'HEAD' });
      const latencyMs = Math.round(performance.now() - start);
      return { ok: true, latencyMs };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      return { ok: false, latencyMs, error: err.message || 'Connection failed' };
    }
  }
}

export const apiService = new ApiService();
export default apiService;

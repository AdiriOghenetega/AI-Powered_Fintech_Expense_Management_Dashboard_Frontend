import { apiRequest } from './api';
import type { Report, ReportData, CreateReportRequest } from '@/types/report';
import type { PaginatedResponse } from '@/types/api';

export interface ReportFilters {
  page?: number;
  limit?: number;
  type?: Report['type'];
  status?: Report['status'];
  startDate?: string;
  endDate?: string;
}

export const reportService = {
  async getReports(filters: ReportFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    return await apiRequest<PaginatedResponse<Report>>('GET', `/reports?${params}`);
  },

  async getReport(id: string) {
    return await apiRequest<{ report: Report }>('GET', `/reports/${id}`);
  },

  async createReport(data: CreateReportRequest) {
    return await apiRequest<{ report: Report }>('POST', '/reports', data);
  },

  async generateReport(id: string) {
    return await apiRequest<{ report: Report; data: ReportData }>('POST', `/reports/${id}/generate`);
  },

  async downloadReport(id: string, format: 'pdf' | 'csv' | 'excel' = 'pdf') {
    const response = await fetch(`/api/reports/${id}/download?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  },

  async deleteReport(id: string) {
    return await apiRequest('DELETE', `/reports/${id}`);
  },

  async duplicateReport(id: string) {
    return await apiRequest<{ report: Report }>('POST', `/reports/${id}/duplicate`);
  },

  async updateSchedule(id: string, scheduleConfig: Report['scheduleConfig']) {
    return await apiRequest<{ report: Report }>('PUT', `/reports/${id}/schedule`, {
      isScheduled: true,
      scheduleConfig,
    });
  },

  async getReportData(parameters: Report['parameters']) {
    return await apiRequest<ReportData>('POST', '/reports/preview', parameters);
  },
};

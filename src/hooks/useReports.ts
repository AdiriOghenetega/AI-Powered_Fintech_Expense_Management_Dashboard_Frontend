import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService, type ReportFilters } from '@/services/reportService';
import type { CreateReportRequest, Report } from '@/types/report';

export const useReports = (filters: ReportFilters = {}) => {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => reportService.getReports(filters),
  });
};

export const useReport = (id: string) => {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => reportService.getReport(id),
    enabled: !!id,
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReportRequest) => reportService.createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reportService.generateReport(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report', id] });
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reportService.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useReportData = (parameters: Report['parameters'], enabled: boolean = true) => {
  return useQuery({
    queryKey: ['report-data', parameters],
    queryFn: () => reportService.getReportData(parameters),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useDownloadReport = () => {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: 'pdf' | 'csv' | 'excel' }) =>
      reportService.downloadReport(id, format),
    onSuccess: (blob, { format }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};

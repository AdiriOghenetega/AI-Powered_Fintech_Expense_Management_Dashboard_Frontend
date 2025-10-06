import React, { useState } from "react";
import {
  FileText,
  Filter,
  Plus,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ReportCard } from "./ReportCard";
import {
  useReports,
  useDeleteReport,
  useDownloadReport,
  useGenerateReport,
} from "@/hooks/useReports";
import type { Report } from "@/types/report";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { ReportFilters } from "@/services/reportService";

interface ReportListProps {
  onGenerateNew: () => void;
}

// Define the expected response structure
interface ReportsListData {
  reports: Report[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

export const ReportList: React.FC<ReportListProps> = ({ onGenerateNew }) => {
  const [filters, setFilters] = useState<ReportFilters>({
    page: 1,
    limit: 10,
  });
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(
    null
  );
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const { data: reportsResponse, isLoading, error } = useReports(filters);
  const deleteReport = useDeleteReport();
  const downloadReport = useDownloadReport();
  const generateReport = useGenerateReport();

  // Type guard to check if response has 'data' property
  const hasDataProperty = (response: any): response is ApiResponse<ReportsListData> => {
    return response && typeof response === 'object' && 'data' in response && response.data;
  };

  // Type guard to check if response has paginated structure
  const isPaginatedResponse = (response: any): response is PaginatedResponse<Report> => {
    return response && typeof response === 'object' && 'items' in response && 'pagination' in response;
  };

  // Type guard to check if response is direct reports data
  const isReportsListData = (response: any): response is ReportsListData => {
    return response && typeof response === 'object' && 'reports' in response && Array.isArray(response.reports);
  };

  // Extract reports data using type guards
  const reportsData: ReportsListData | null = React.useMemo(() => {
    if (!reportsResponse) return null;

    // Handle ApiResponse<ReportsListData> format
    if (hasDataProperty(reportsResponse)) {
      return reportsResponse.data || null;
    }

    // Handle PaginatedResponse format
    if (isPaginatedResponse(reportsResponse)) {
      return {
        reports: reportsResponse.items,
        pagination: reportsResponse.pagination
      };
    }

    // Handle direct ReportsListData format
    if (isReportsListData(reportsResponse)) {
      return reportsResponse;
    }

    // Ensure we always return null instead of undefined
    return null;
  }, [reportsResponse]);

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteReport.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
  };

  const handleDownload = async (
    id: string,
    format: "pdf" | "csv" | "excel" = "pdf"
  ): Promise<void> => {
    try {
      setDownloadingReportId(id);
      await downloadReport.mutateAsync({ id, format });
    } catch (error) {
      console.error("Failed to download report:", error);
    } finally {
      setDownloadingReportId(null);
    }
  };

  const handleRegenerate = async (id: string): Promise<void> => {
    try {
      await generateReport.mutateAsync(id);
    } catch (error) {
      console.error("Failed to regenerate report:", error);
    }
  };

  const handlePageChange = (newPage: number): void => {
    setFilters({ ...filters, page: newPage });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Skeleton */}
          <div className="mb-6 space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded-lg skeleton"></div>
            <div className="h-4 w-72 bg-gray-200 rounded skeleton"></div>
          </div>
          
          {/* Content Skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i: number) => (
              <Card key={i}>
                <div className="h-24 skeleton rounded-xl"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center scale-in">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading reports</h2>
          <p className="text-gray-600 mb-6">Please try refreshing the page</p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  const reports: Report[] = reportsData?.reports || [];
  const pagination = reportsData?.pagination;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Mobile-Responsive Header */}
        <div className="slide-in-from-left">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Generate and manage your financial reports
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Mobile filter toggle */}
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden"
                icon={<Filter className="h-4 w-4" />}
              >
                Filters
              </Button>
              
              <Button 
              variant='gradient'
                onClick={onGenerateNew}
                icon={<Plus className="h-4 w-4" />}
                className="flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Generate New Report</span>
                <span className="sm:hidden">New Report</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile-Responsive Filters */}
        <div className={`transition-all duration-500 ease-in-out ${
          showFilters ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden sm:opacity-100 sm:max-h-96'
        }`}>
          <Card variant="glass" className="backdrop-blur-md slide-in-from-top">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Filter by type:</span>
                </div>
                
                <div className="relative">
                  <select
                    value={filters.type || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        type: (e.target.value as ReportFilters['type']) || undefined,
                        page: 1,
                      })
                    }
                    className="w-full sm:w-auto appearance-none bg-white/80 border border-white/20 rounded-xl px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm"
                  >
                    <option value="">All Types</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="text-sm text-gray-600 text-center sm:text-right">
                <span className="font-medium">{pagination?.totalCount || 0}</span> reports total
              </div>
            </div>
          </Card>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="scale-in">
            <Card variant="elevated" className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No reports yet
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-sm sm:text-base">
                Generate your first financial report to get started with analytics and insights.
              </p>
              <Button 
                onClick={onGenerateNew}
                icon={<Plus className="h-4 w-4" />}
                variant="gradient"
                size="lg"
              >
                Generate Your First Report
              </Button>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report: Report, index: number) => (
              <div 
                key={report.id}
                className="stagger-item"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ReportCard
                  report={report}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  onRegenerate={handleRegenerate}
                  downloadingReportId={downloadingReportId}
                  isRegenerating={generateReport.isPending}
                  isDeleting={deleteReport.isPending}
                />
              </div>
            ))}
          </div>
        )}

        {/* Mobile-Responsive Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="slide-in-from-bottom">
            <Card variant="glass" className="backdrop-blur-md">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                  <span className="hidden sm:inline"> • {pagination.totalCount} total reports</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.currentPage === 1}
                    className="hidden sm:flex"
                  >
                    First
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </Button>
                  
                  {/* Page numbers - simplified for mobile */}
                  <div className="hidden sm:flex items-center space-x-1">
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i: number) => {
                      const page = Math.max(1, pagination.currentPage - 2) + i;
                      if (page > pagination.totalPages) return null;
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                            page === pagination.currentPage
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'text-gray-600 hover:bg-white/60'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="hidden sm:flex"
                  >
                    Last
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Loading overlays */}
        {(deleteReport.isPending || generateReport.isPending) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
            <Card variant="elevated" className="p-8">
              <div className="flex items-center space-x-4">
                <LoadingSpinner variant="gradient" />
                <span className="font-medium text-gray-900">
                  {deleteReport.isPending ? 'Deleting report...' : 'Regenerating report...'}
                </span>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
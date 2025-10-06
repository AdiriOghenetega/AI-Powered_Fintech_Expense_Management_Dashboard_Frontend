import React, { useState } from "react";
import {
  Download,
  Trash2,
  Calendar,
  Clock,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Report } from "@/types/report";

interface ReportCardProps {
  report: Report;
  onDelete: (id: string) => void;
  onDownload: (id: string, format: "pdf" | "csv" | "excel") => void;
  onRegenerate: (id: string) => void;
  downloadingReportId: string | null;
  isRegenerating: boolean;
  isDeleting: boolean;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status: Report["status"]) => {
  switch (status) {
    case "completed":
      return "text-green-600 bg-green-100";
    case "generating":
      return "text-blue-600 bg-blue-100";
    case "pending":
      return "text-yellow-600 bg-yellow-100";
    case "failed":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const getTypeIcon = (type: Report["type"]) => {
  switch (type) {
    case "monthly":
      return "📅";
    case "quarterly":
      return "📊";
    case "yearly":
      return "🗓️";
    case "custom":
      return "⚙️";
    default:
      return "📄";
  }
};

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onDelete,
  onDownload,
  onRegenerate,
  downloadingReportId,
  isRegenerating,
  isDeleting,
}) => {
  const [showMobileActions, setShowMobileActions] = useState(false);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      onDelete(report.id);
    }
    setShowMobileActions(false);
  };

  const handleDownload = (format: "pdf" | "csv" | "excel") => {
    onDownload(report.id, format);
    setShowMobileActions(false);
  };

  const handleRegenerate = () => {
    onRegenerate(report.id);
    setShowMobileActions(false);
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
          <div className="text-xl sm:text-2xl flex-shrink-0">{getTypeIcon(report.type)}</div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                {report.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    report.status
                  )}`}
                >
                  {report.status.charAt(0).toUpperCase() +
                    report.status.slice(1)}
                </span>
                {report.isScheduled && (
                  <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Scheduled
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-xs sm:text-sm text-gray-500">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {formatDate(report.parameters.startDate)} -{" "}
                  {formatDate(report.parameters.endDate)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0">
                <span>Generated: {formatDate(report.generatedAt)}</span>
                <span>Downloads: {report.downloadCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center space-x-2 flex-shrink-0">
          {report.status === "completed" && (
            <div className="relative group">
              <Button
                variant="secondary"
                size="sm"
                loading={downloadingReportId === report.id}
                disabled={downloadingReportId === report.id}
              >
                <Download className="h-4 w-4" />
              </Button>
              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleDownload("pdf")}
                  disabled={downloadingReportId === report.id}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 first:rounded-t-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  PDF
                </button>
                <button
                  onClick={() => handleDownload("csv")}
                  disabled={downloadingReportId === report.id}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  CSV
                </button>
                <button
                  onClick={() => handleDownload("excel")}
                  disabled={downloadingReportId === report.id}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 last:rounded-b-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Excel
                </button>
              </div>
            </div>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRegenerate}
            loading={isRegenerating}
            disabled={report.status === "generating"}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleDelete}
            loading={isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Actions */}
        <div className="sm:hidden flex justify-end">
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowMobileActions(!showMobileActions)}
              className="p-2"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            
            {showMobileActions && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-20 min-w-[160px]">
                {report.status === "completed" && (
                  <>
                    <button
                      onClick={() => handleDownload("pdf")}
                      disabled={downloadingReportId === report.id}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center disabled:opacity-50"
                    >
                      <Download className="h-4 w-4 mr-3" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => handleDownload("csv")}
                      disabled={downloadingReportId === report.id}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center disabled:opacity-50"
                    >
                      <Download className="h-4 w-4 mr-3" />
                      Download CSV
                    </button>
                    <button
                      onClick={() => handleDownload("excel")}
                      disabled={downloadingReportId === report.id}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center disabled:opacity-50"
                    >
                      <Download className="h-4 w-4 mr-3" />
                      Download Excel
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                  </>
                )}
                
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating || report.status === "generating"}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4 mr-3" />
                  Regenerate
                </button>
                
                <div className="border-t border-gray-100 my-1"></div>
                
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click overlay to close mobile actions */}
      {showMobileActions && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowMobileActions(false)}
        />
      )}
    </Card>
  );
};
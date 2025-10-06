import React, { useState } from 'react';
import { ReportList } from '@/components/reports/ReportList';
import { ReportGenerator } from '@/components/reports/ReportGenerator';

export const ReportsPage: React.FC = () => {
  const [showGenerator, setShowGenerator] = useState(false);

  const handleGenerateSuccess = () => {
    setShowGenerator(false);
    // Optionally show a success message
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <ReportList onGenerateNew={() => setShowGenerator(true)} />
      
      {showGenerator && (
        <ReportGenerator
          onClose={() => setShowGenerator(false)}
          onSuccess={handleGenerateSuccess}
        />
      )}
    </div>
  );
};

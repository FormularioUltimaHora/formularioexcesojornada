
import React from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, description, children }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3 mb-4">{title}</h2>
       {description && <p className="text-sm text-slate-500 mb-4">{description}</p>}
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
        {children}
      </div>
    </div>
  );
};

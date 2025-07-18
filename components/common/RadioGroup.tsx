
import React from 'react';
import { YesNoNull } from '../../types';

interface RadioGroupProps {
  label: string;
  name: string;
  value: YesNoNull;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  containerClassName?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ label, name, value, onChange, containerClassName = '' }) => {
  const baseId = name;
  return (
    <div className={containerClassName}>
      <span className="block text-sm font-medium leading-6 text-slate-700">{label}</span>
      <div className="mt-2 flex items-center gap-x-6">
        <div className="flex items-center gap-x-2">
          <input
            id={`${baseId}-yes`}
            name={name}
            type="radio"
            value="yes"
            checked={value === 'yes'}
            onChange={onChange}
            className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-600"
          />
          <label htmlFor={`${baseId}-yes`} className="block text-sm font-medium leading-6 text-slate-900">
            Sí
          </label>
        </div>
        <div className="flex items-center gap-x-2">
          <input
            id={`${baseId}-no`}
            name={name}
            type="radio"
            value="no"
            checked={value === 'no'}
            onChange={onChange}
            className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-600"
          />
          <label htmlFor={`${baseId}-no`} className="block text-sm font-medium leading-6 text-slate-900">
            No
          </label>
        </div>
      </div>
    </div>
  );
};

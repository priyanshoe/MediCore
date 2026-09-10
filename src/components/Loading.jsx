import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading({ message = 'Loading data...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[220px] p-8 text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
      <p className="text-sm font-medium tracking-wide">{message}</p>
    </div>
  );
}

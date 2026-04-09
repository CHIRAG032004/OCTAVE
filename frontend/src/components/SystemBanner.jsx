import React from 'react';
import { useRuntimeStatus } from '../hooks/useRuntimeStatus';

const SystemBanner = () => {
  const runtimeStatus = useRuntimeStatus();

  if (!runtimeStatus?.warnings?.length) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <p className="text-sm font-semibold">Limited mode is active</p>
        <ul className="mt-1 text-sm list-disc pl-5">
          {runtimeStatus.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SystemBanner;

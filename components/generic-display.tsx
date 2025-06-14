import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils"
import AgentTraceDisplay from './agent-trace-display';

interface GenericDisplayProps {
  data: any;
  isRoot?: boolean;
}

const LoadingSpinner = () => (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex space-x-2">
        <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500 [animation-delay:-0.3s]"></div>
        <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500 [animation-delay:-0.15s]"></div>
        <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500"></div>
      </div>
    </div>
  );

const isAgentTrace = (data: any): boolean => {
    return (
      Array.isArray(data) &&
      data.length > 0 &&
      typeof data[0] === 'object' &&
      data[0] !== null &&
      'agent_name' in data[0] &&
      'actions' in data[0] &&
      Array.isArray(data[0].actions)
    );
  };

const GenericDisplay: React.FC<GenericDisplayProps> = ({ data, isRoot = true }) => {
  if (data === null || data === undefined) {
    return isRoot ? <LoadingSpinner /> : null;
  }

  if (isRoot && isAgentTrace(data)) {
    return <AgentTraceDisplay data={data} />;
  }

  if (Array.isArray(data)) {
    return (
      <div className={cn("space-y-2", isRoot ? "" : "pl-4")}>
        {data.map((item, index) => (
          <div key={index} className="rounded-lg border bg-gray-50 p-3">
            <GenericDisplay data={item} isRoot={false} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof data === 'object') {
    return (
      <div className={cn("space-y-2", isRoot ? "" : "pl-4")}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <strong className="font-semibold text-gray-800">{key}:</strong>
            <div className="pl-4">
              <GenericDisplay data={value} isRoot={false} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (typeof data === 'string') {
    if (data.includes('\\n')) {
        return (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.replace(/\\n/g, '\n')}</ReactMarkdown>
          </div>
        )
    }
    return <span className="text-gray-700">{data}</span>;
  }

  return <span className="text-gray-700">{String(data)}</span>;
};

export default GenericDisplay; 
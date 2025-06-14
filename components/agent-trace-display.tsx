import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown, ChevronUp, Clipboard, Check } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Action {
  action: string;
  result: string;
}

interface AgentTrace {
  agent_name: string;
  actions: Action[];
}

interface AgentTraceDisplayProps {
  data: AgentTrace[];
}

const AgentTraceDisplay: React.FC<AgentTraceDisplayProps> = ({ data }) => {
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [actionCollapsed, setActionCollapsed] = useState<Record<string, boolean>>({});

  const numberToChineseStep = (n: number): string => {
    const chineseStepMap: { [key: number]: string } = {
        1: '第一步',
        2: '第二步',
        3: '第三步',
        4: '第四步',
        5: '第五步',
        6: '第六步',
        7: '第七步',
        8: '第八步',
        9: '第九步',
        10: '第十步',
    };
    return chineseStepMap[n] || `第 ${n} 步`;
  }

  const toggleCollapse = (index: number) => {
    setCollapsed(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleActionCollapse = (key: string) => {
    setActionCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  return (
    <div className="space-y-4 p-4 font-sans">
      {data.map((trace, index) => (
        <div key={index} className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div 
            className="flex cursor-pointer items-center justify-between p-4"
            onClick={() => toggleCollapse(index)}
          >
            <h2 className="text-lg font-semibold text-gray-800">{trace.agent_name}</h2>
            {collapsed[index] ? <ChevronDown className="h-5 w-5 text-gray-500" /> : <ChevronUp className="h-5 w-5 text-gray-500" />}
          </div>
          {!collapsed[index] && (
            <div className="border-t border-gray-200 p-4">
              <div className="space-y-3">
                {(trace.actions || []).map((action, actionIndex) => {
                  const actionKey = `${index}-${actionIndex}`;
                  const isActionCollapsed = actionCollapsed[actionKey];
                  let isPlanMessage = false;
                  try {
                    const parsedAction = JSON.parse(action.action);
                    if (parsedAction.tool === 'plan_message') {
                      isPlanMessage = true;
                    }
                  } catch (e) {
                    // Not a JSON string, check for direct match
                    if (action.action === 'plan_message') {
                      isPlanMessage = true;
                    }
                  }

                  return (
                    <div key={actionIndex} className="relative rounded-lg bg-gray-50/50 p-3">
                      {isPlanMessage && (
                        <button
                          onClick={() => handleCopy(action.result, actionKey)}
                          className="absolute right-2 top-2 z-10 rounded-md bg-gray-200 p-1 hover:bg-gray-300"
                          title="Copy result"
                        >
                          {copied[actionKey] ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clipboard className="h-4 w-4 text-gray-600" />
                          )}
                        </button>
                      )}
                      <div 
                        className="flex cursor-pointer items-center justify-between"
                        onClick={() => toggleActionCollapse(actionKey)}
                      >
                        <div className="flex items-baseline">
                          <span className="mr-2 font-semibold text-gray-500">{numberToChineseStep(actionIndex + 1)}</span>
                          <p className="font-mono text-base font-bold text-blue-600">{action.action}</p>
                        </div>
                        {isActionCollapsed ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronUp className="h-4 w-4 text-gray-500" />}
                      </div>
                      {!isActionCollapsed && (
                        <div className="prose prose-sm max-w-none pt-2 text-gray-700">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {(action.result || '').replace(/\\n/g, '\n')}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AgentTraceDisplay; 
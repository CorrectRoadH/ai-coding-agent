"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAgents } from "@/hooks/useAgents" // 导入新的 hook
import type { AgentType } from "@/types/agent"

interface AgentSelectionProps {
  onAgentSelect: (agent: AgentType, initialMessage?: string) => void
}

export default function AgentSelection({ onAgentSelect }: AgentSelectionProps) {
  const { agents } = useAgents() // 使用 useAgents hook

  return (
    <div className="flex-1 p-8 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8">选择 AI Agent</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className={`relative cursor-pointer hover:shadow-md transition-shadow ${
                agent.disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => !agent.disabled && onAgentSelect(agent.id)}
            >
              {agent.disabled && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  敬请期待
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex justify-center mb-2">
                  <agent.icon className="h-12 w-12 text-gray-600" />
                </div>
                <CardTitle className="text-center">{agent.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">{agent.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-center mt-8 mb-4">来自GitHub的任务</h2>
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onAgentSelect("planning", "【开发】【HYD267568】父工作流直接使用子工作流输出的变量")}
        >
          <CardContent className="flex items-center p-4">
            <svg className="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="text-gray-700">【开发】【HYD267568】父工作流直接使用子工作流输出的变量</span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

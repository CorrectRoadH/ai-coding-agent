"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAgents } from "@/hooks/useAgents" // 导入新的 hook
import type { AgentType } from "@/types/agent"

interface AgentSelectionProps {
  onAgentSelect: (agent: AgentType) => void
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
      </div>
    </div>
  )
}

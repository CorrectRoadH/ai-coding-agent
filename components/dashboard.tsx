"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Github,
  Briefcase,
  CircleDashed,
  CheckCircle2,
  Clock,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"
import { useAgents } from "@/hooks/useAgents"
import { AgentType } from "@/types/agent"

interface AgentStat {
  ongoing: number
  completed: number
  timeSaved: string
  costSaved: string
  attribution?: {
    name: string
    icon: React.ReactNode
  }[]
}

const agentStats: Record<AgentType, AgentStat> = {
  requirements: {
    ongoing: 0,
    completed: 10,
    timeSaved: "10h",
    costSaved: "$100",
  },
  planning: {
    ongoing: 1,
    completed: 9,
    timeSaved: "9h",
    costSaved: "$900",
  },
  coding: {
    ongoing: 0,
    completed: 9,
    timeSaved: "25h",
    costSaved: "$25,000",
    attribution: [
      { name: "Copilot", icon: <Github className="h-5 w-5" /> },
      { name: "Cursor", icon: <Briefcase className="h-5 w-5" /> },
    ],
  },
}

export default function Dashboard() {
  const { agents } = useAgents()

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex items-center h-20 px-6 border-b bg-white">
        <Link href="/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold ml-4">Dashboard</h1>
      </header>

      <main className="flex-1 p-8 overflow-auto">
        <div className="grid grid-cols-3 gap-8">
          {agents.map((agent) => {
            const stats = agentStats[agent.id]
            const Icon = agent.icon
            return (
              <Card key={agent.id}>
                <CardHeader className="items-center pb-2">
                  <div className="flex justify-center mb-2">
                    <Icon className="h-12 w-12 text-gray-600" />
                  </div>
                  <CardTitle className="text-center">{agent.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="mb-4 h-10">{agent.description}</CardDescription>

                  <div className="grid grid-cols-2 gap-4 text-center mb-6">
                    <div>
                      <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                        <CircleDashed className="h-4 w-4" />
                        进行中
                      </p>
                      <p className="text-2xl font-bold">{stats.ongoing}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        已完成
                      </p>
                      <p className="text-2xl font-bold">{stats.completed}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-gray-100 shadow-inner">
                      <CardHeader className="p-2 pb-0 flex flex-row items-center justify-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <CardTitle className="text-sm font-medium">节约时间</CardTitle>
                      </CardHeader>
                      <CardContent className="p-2">
                        <p className="text-xl font-bold text-green-600">{stats.timeSaved}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-100 shadow-inner">
                      <CardHeader className="p-2 pb-0 flex flex-row items-center justify-center gap-1">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <CardTitle className="text-sm font-medium">节约成本</CardTitle>
                      </CardHeader>
                      <CardContent className="p-2">
                        <p className="text-xl font-bold text-green-600">{stats.costSaved}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {stats.attribution && (
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">归属</h4>
                      <div className="flex items-center justify-center gap-4">
                        {stats.attribution.map((attr) => (
                          <div key={attr.name} className="flex items-center gap-2 text-sm text-gray-700">
                            {attr.icon}
                            <span>{attr.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
} 
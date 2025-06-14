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
  TrendingUp,
  Zap,
  Users,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"
import { useAgents } from "@/hooks/useAgents"
import { AgentType } from "@/types/agent"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"

interface AgentStat {
  ongoing: number
  completed: number
  timeSaved: string
  costSaved: string
  attribution?: {
    title: string
    items: {
      name: string
      icon: React.ReactNode
    }[]
  }
  languages?: {
    name: string
    value: number
    color: string
  }[]
}

const agentStats: Record<AgentType, AgentStat> = {
  requirements: {
    ongoing: 0,
    completed: 10,
    timeSaved: "10h",
    costSaved: "¥ 1000",
    attribution: {
      title: "需求来源",
      items: [{ name: "GitHub", icon: <Github className="h-5 w-5" /> }],
    },
    languages: [
      { name: "GitHub", value: 100, color: "#333" },
    ],
  },
  planning: {
    ongoing: 1,
    completed: 9,
    timeSaved: "9h",
    costSaved: "¥ 9000",
  },
  coding: {
    ongoing: 0,
    completed: 9,
    timeSaved: "25h",
    costSaved: "¥ 25000",
    attribution: {
      title: "调用",
      items: [
        { name: "Copilot", icon: <Github className="h-5 w-5" /> },
        { name: "Cursor", icon: <Briefcase className="h-5 w-5" /> },
      ],
    },
    languages: [
      { name: "TypeScript", value: 65, color: "#3178c6" },
      { name: "Python", value: 35, color: "#3572A5" },
    ],
  },
}

// 添加趋势数据
const trendData = [
  { date: "周一", completed: 2, ongoing: 1 },
  { date: "周二", completed: 3, ongoing: 2 },
  { date: "周三", completed: 1, ongoing: 3 },
  { date: "周四", completed: 4, ongoing: 1 },
  { date: "周五", completed: 2, ongoing: 2 },
  { date: "周六", completed: 1, ongoing: 1 },
  { date: "周日", completed: 3, ongoing: 0 },
]

// 添加效率指标
const efficiencyMetrics = {
  avgCompletionTime: "2.5h",
  costPerTask: "¥ 2500",
  teamSize: 3,
  productivity: "+45%",
}

export default function Dashboard() {
  const { agents } = useAgents()
  const requirementsStats = agentStats.requirements
  const codingStats = agentStats.coding

  // 计算总览数据
  const totalCompleted = Object.values(agentStats).reduce((sum, stat) => sum + stat.completed, 0)
  const totalOngoing = Object.values(agentStats).reduce((sum, stat) => sum + stat.ongoing, 0)
  const totalTimeSaved = "44h"
  const totalCostSaved = "¥ 35000"

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
        {/* 总览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">总完成数</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCompleted}</div>
              <p className="text-xs text-muted-foreground">较上周 +20%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">进行中</CardTitle>
              <CircleDashed className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOngoing}</div>
              <p className="text-xs text-muted-foreground">较上周 -15%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">总节约时间</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTimeSaved}</div>
              <p className="text-xs text-muted-foreground">较上周 +30%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">总节约成本</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCostSaved}</div>
              <p className="text-xs text-muted-foreground">较上周 +25%</p>
            </CardContent>
          </Card>
        </div>

        {/* 效率指标 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">平均完成时间</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{efficiencyMetrics.avgCompletionTime}</div>
              <p className="text-xs text-muted-foreground">较上周 -15%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">单任务成本</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{efficiencyMetrics.costPerTask}</div>
              <p className="text-xs text-muted-foreground">较上周 -10%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">团队规模</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{efficiencyMetrics.teamSize}</div>
              <p className="text-xs text-muted-foreground">较上周 +1人</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">生产力提升</CardTitle>
              <Activity className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{efficiencyMetrics.productivity}</div>
              <p className="text-xs text-muted-foreground">较上周 +5%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
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

                  {stats.attribution && agent.id === "coding" && (
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">
                        {stats.attribution.title}
                      </h4>
                      <div className="flex items-center justify-center gap-4">
                        {stats.attribution.items.map((attr) => (
                          <div
                            key={attr.name}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {requirementsStats.languages && (
            <Card>
              <CardHeader>
                <CardTitle>需求来源</CardTitle>
                <CardDescription>所有需求均通过 GitHub issue 进行跟踪。</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={requirementsStats.languages}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={false}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {requirementsStats.languages.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-4 mt-4 text-2xl font-semibold">
                  {requirementsStats.attribution?.items?.[0]?.icon}
                  <span>{requirementsStats.attribution?.items?.[0]?.name ?? 'GitHub'}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {codingStats.languages && (
            <Card>
              <CardHeader>
                <CardTitle>语言占比</CardTitle>
                <CardDescription>项目中使用的主要编程语言分布。</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={codingStats.languages}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={false}
                        label={({
                          cx,
                          cy,
                          midAngle,
                          innerRadius,
                          outerRadius,
                          percent,
                        }) => {
                          const RADIAN = Math.PI / 180
                          const radius =
                            innerRadius + (outerRadius - innerRadius) * 0.5
                          const x = cx + radius * Math.cos(-midAngle * RADIAN)
                          const y = cy + radius * Math.sin(-midAngle * RADIAN)
                          return (
                            <text
                              x={x}
                              y={y}
                              fill="white"
                              textAnchor={x > cx ? "start" : "end"}
                              dominantBaseline="central"
                            >
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          )
                        }}
                      >
                        {codingStats.languages.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 趋势图表 - 移到最后 */}
        <Card>
          <CardHeader>
            <CardTitle>任务完成趋势</CardTitle>
            <CardDescription>过去一周的任务完成情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#22c55e" name="已完成" />
                  <Line type="monotone" dataKey="ongoing" stroke="#3b82f6" name="进行中" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 
"use client"

import type React from "react"

import type { AgentType, MessageAction } from "@/types/agent"
import { FileText, Code, ListTodo } from "lucide-react"

interface AgentDefinition {
  id: AgentType
  title: string
  description: string
  icon: React.ElementType
  disabled: boolean
}

export function useAgents() {
  const agents: AgentDefinition[] = [
    {
      id: "requirements",
      title: "需求分析 Agent",
      description: "帮助分析和明确项目需求，生成详细的需求文档",
      icon: FileText,
      disabled: false,
    },
    {
      id: "planning",
      title: "计划 Agent",
      description: "根据需求制定详细的项目计划，包括任务分解和时间线",
      icon: ListTodo,
      disabled: false,
    },
    {
      id: "coding",
      title: "代码 Agent",
      description: "根据需求和计划生成高质量的代码实现",
      icon: Code,
      disabled: true, // 标记为禁用
    },
  ]

  const getAgentTitle = (agent: AgentType): string => {
    const foundAgent = agents.find((a) => a.id === agent)
    const baseTitle = foundAgent ? foundAgent.title : "未知 Agent"
    // 去掉 " Agent" 后缀并截取前两个字
    return baseTitle.replace(/ Agent$/, "").slice(0, 2)
  }

  // 生成消息操作按钮
  const generateMessageActions = (agent: AgentType): MessageAction[] => {
    switch (agent) {
      case "requirements":
        return [
          {
            id: "detail",
            label: "查看详情",
            type: "detail",
            variant: "outline",
            icon: "FileText",
          },
          {
            id: "copy-copilot",
            label: "复制到 Copilot",
            type: "copy",
            variant: "outline",
            icon: "Copy",
          },
          {
            id: "next-planning",
            label: "进入 Plan 阶段",
            type: "next-stage",
            variant: "default",
            icon: "ArrowRight",
          },
        ]
      case "planning":
        return [
          {
            id: "detail",
            label: "查看详情",
            type: "detail",
            variant: "outline",
            icon: "FileText",
          },
          {
            id: "copy-copilot",
            label: "复制到 Copilot",
            type: "copy",
            variant: "outline",
            icon: "Copy",
          },
          {
            id: "copy-cursor",
            label: "复制到 Cursor",
            type: "copy",
            variant: "outline",
            icon: "Copy",
          },
          {
            id: "next-coding",
            label: "进入 Coding 阶段",
            type: "next-stage",
            variant: "default",
            icon: "Code",
            disabled: true, // 将此按钮禁用
          },
        ]
      case "coding":
        return [
          {
            id: "detail",
            label: "查看详情",
            type: "detail",
            variant: "outline",
            icon: "FileText",
          },
          {
            id: "copy-copilot",
            label: "复制到 Copilot",
            type: "copy",
            variant: "outline",
            icon: "Copy",
          },
          {
            id: "copy-cursor",
            label: "复制到 Cursor",
            type: "copy",
            variant: "outline",
            icon: "Copy",
          },
          {
            id: "export-project",
            label: "导出项目",
            type: "export",
            variant: "secondary",
            icon: "Download",
          },
        ]
      default:
        return []
    }
  }

  return {
    agents,
    getAgentTitle,
    generateMessageActions,
  }
}

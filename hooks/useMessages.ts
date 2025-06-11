"use client"

import { useState, useCallback } from "react"
import type { ChatMessage, AgentType, DetailContent, MessageAction } from "@/types/agent"
import { toast } from "sonner"
import { useAgents } from "./useAgents" // 导入 useAgents hook

// 生成简短响应内容的辅助函数
function generateResponse(agent: AgentType | null, message: string): string {
  if (!agent) return ""

  switch (agent) {
    case "requirements":
      return "我已经分析了您的需求，点击查看详细的需求分析文档。"
    case "planning":
      return "我已经为您的项目制定了计划，点击查看详细的项目计划。"
    case "coding":
      return "我已经生成了代码实现，点击查看详细的代码和说明。"
    default:
      return "我收到了您的消息，但我不确定如何处理它。"
  }
}

// 生成详细内容的辅助函数
function generateDetailContent(agent: AgentType): string {
  switch (agent) {
    case "requirements":
      return `# 需求分析文档

## 功能需求
1. 用户认证与授权
   - 用户注册和登录
   - 权限管理
   - 密码重置

2. 核心功能
   - 功能A的详细描述
   - 功能B的详细描述
   - 功能C的详细描述

3. 用户界面要求
   - 响应式设计
   - 无障碍设计考虑
   - 支持的浏览器和设备

## 非功能需求
1. 性能要求
   - 响应时间
   - 并发用户数
   - 吞吐量

2. 安全要求
   - 数据加密
   - 防止SQL注入
   - CSRF保护

3. 可靠性要求
   - 系统可用性
   - 备份和恢复策略`

    case "planning":
      return `# 项目计划

## 阶段一：需求分析与设计 (1-2周)
- 收集和分析用户需求
- 创建系统架构设计
- 设计数据库模型
- 创建UI/UX原型

## 阶段二：核心功能开发 (3-4周)
- 实现用户认证系统
- 开发核心业务逻辑
- 创建API端点
- 实现前端界面

## 阶段三：测试与优化 (2周)
- 单元测试和集成测试
- 性能优化
- 安全审查
- 用户验收测试

## 阶段四：部署与维护 (1周)
- 准备生产环境
- 部署应用程序
- 监控和日志设置
- 文档完善

## 技术栈
- 前端：React, Next.js, TailwindCSS
- 后端：Node.js, Express
- 数据库：PostgreSQL
- 部署：Vercel, Docker`

    case "coding":
      return `# 代码实现

\`\`\`tsx
// components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Logging in with:', { email, password });
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">登录</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              邮箱
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              密码
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
\`\`\`

## 使用说明
1. 将此组件导入到您的页面中
2. 实现认证逻辑
3. 添加错误处理和表单验证`

    default:
      return ""
  }
}

export function useMessages(
  chatId: string | null,
  agent: AgentType | null, // 当前选中的 agent
  onUpdateChatMessages?: (chatId: string, messages: ChatMessage[]) => void,
  onNextStage?: (nextAgent: AgentType, initialMessage?: string) => void,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [detailContent, setDetailContent] = useState<DetailContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getAgentTitle, generateMessageActions } = useAgents() // 从 useAgents 导入

  // 获取消息
  const fetchMessages = useCallback(async (chatId: string) => {
    if (!chatId) return

    setLoading(true)
    setError(null)
    try {
      // 在这里可以替换为真实的API调用
      await new Promise((resolve) => setTimeout(resolve, 500))
      setMessages([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取消息失败")
    } finally {
      setLoading(false)
    }
  }, [])

  // 发送消息
  const sendMessage = useCallback(
    async (content: string) => {
      if (!agent || !chatId) return null

      setLoading(true)
      setError(null)
      try {
        // 创建用户消息
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          content,
          role: "user",
          timestamp: new Date(),
        }

        const newMessages = [...messages, userMessage]
        setMessages(newMessages)

        // 立即更新对话列表中的消息
        if (onUpdateChatMessages) {
          onUpdateChatMessages(chatId, newMessages)
        }

        // 模拟API调用延迟
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // 创建AI响应 - 简短回复 + 详细内容
        const detailContent = generateDetailContent(agent)
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: generateResponse(agent, content), // 简短回复
          role: "assistant",
          timestamp: new Date(),
          actions: generateMessageActions(agent),
          detailContent: detailContent, // 详细内容存储在这里
        }

        const finalMessages = [...newMessages, aiResponse]
        setMessages(finalMessages)

        // 更新对话列表中的消息
        if (onUpdateChatMessages) {
          onUpdateChatMessages(chatId, finalMessages)
        }

        return aiResponse
      } catch (err) {
        setError(err instanceof Error ? err.message : "发送消息失败")
        return null
      } finally {
        setLoading(false)
      }
    },
    [agent, chatId, messages, onUpdateChatMessages, generateMessageActions, getAgentTitle],
  )

  // 发送消息（支持直接传入chatId和指定agent类型）
  const sendMessageWithChatId = useCallback(
    async (content: string, targetChatId: string, targetAgent?: AgentType) => {
      // 修复：使用传入的 targetAgent 或当前的 agent
      const effectiveAgent = targetAgent || agent
      if (!effectiveAgent) return null

      setLoading(true)
      setError(null)
      try {
        // 创建用户消息
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          content,
          role: "user",
          timestamp: new Date(),
        }

        // 修复：对于新对话，从空白开始，不使用当前的 messages
        const currentMessages = targetChatId === chatId ? messages : []
        const newMessages = [...currentMessages, userMessage]
        setMessages(newMessages)

        // 立即更新对话列表中的消息
        if (onUpdateChatMessages) {
          onUpdateChatMessages(targetChatId, newMessages)
        }

        // 模拟API调用延迟
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // 创建AI响应 - 简短回复 + 详细内容
        const detailContent = generateDetailContent(effectiveAgent)
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: generateResponse(effectiveAgent, content), // 简短回复
          role: "assistant",
          timestamp: new Date(),
          actions: generateMessageActions(effectiveAgent),
          detailContent: detailContent, // 详细内容存储在这里
        }

        const finalMessages = [...newMessages, aiResponse]
        setMessages(finalMessages)

        // 更新对话列表中的消息
        if (onUpdateChatMessages) {
          onUpdateChatMessages(targetChatId, finalMessages)
        }

        return aiResponse
      } catch (err) {
        setError(err instanceof Error ? err.message : "发送消息失败")
        return null
      } finally {
        setLoading(false)
      }
    },
    [agent, messages, chatId, onUpdateChatMessages, generateMessageActions, getAgentTitle],
  )

  // 处理消息操作
  const handleMessageAction = useCallback(
    (messageId: string, action: MessageAction) => {
      const message = messages.find((m) => m.id === messageId)
      if (!message) return

      switch (action.type) {
        case "detail":
          // 显示详细内容在右侧面板
          if (message.role === "assistant" && message.detailContent && agent) {
            const detail: DetailContent = {
              id: messageId,
              title: `${getAgentTitle(agent)} 详情`,
              content: message.detailContent, // 使用消息中存储的详细内容
            }
            setDetailContent(detail)
          }
          break

        case "copy":
          // 复制详细内容
          if (message.role === "assistant" && message.detailContent) {
            navigator.clipboard.writeText(message.detailContent).then(() => {
              toast.success("复制成功", {
                description: `内容已复制到剪贴板`,
              })
            })
          }
          break

        case "next-stage":
          // 进入下一阶段，传递详细内容
          if (onNextStage && agent && message.detailContent) {
            let nextAgent: AgentType
            if (agent === "requirements") {
              nextAgent = "planning"
            } else if (agent === "planning") {
              nextAgent = "coding"
            } else {
              return
            }
            // 使用消息中存储的详细内容作为下一阶段的初始消息
            console.log("Calling onNextStage with:", nextAgent, message.detailContent.substring(0, 50) + "...")
            onNextStage(nextAgent, message.detailContent)
          }
          break

        case "export":
          if (agent === "coding" && message.role === "assistant" && message.detailContent) {
            const blob = new Blob([message.detailContent], { type: "text/markdown" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "project-code.md"
            a.click()
            URL.revokeObjectURL(url)
          }
          break

        default:
          break
      }
    },
    [messages, agent, onNextStage, getAgentTitle, toast],
  )

  // 查看详细内容
  const viewDetail = useCallback(
    (messageId: string) => {
      const message = messages.find((m) => m.id === messageId)
      if (message && message.role === "assistant" && message.detailContent && agent) {
        const detail: DetailContent = {
          id: messageId,
          title: `${getAgentTitle(agent)} 详情`,
          content: message.detailContent, // 使用消息中存储的详细内容
        }
        setDetailContent(detail)
        return detail
      }
      return null
    },
    [messages, agent, getAgentTitle],
  )

  // 清除消息
  const clearMessages = useCallback(() => {
    setMessages([])
    setDetailContent(null)
  }, [])

  // 设置消息 - 修复历史对话操作按钮问题
  const setMessagesData = useCallback(
    (newMessages: ChatMessage[], agentTypeForHistoricalMessages?: AgentType) => {
      // 确定用于生成操作按钮的 agent 类型
      const agentForActions = agentTypeForHistoricalMessages || agent

      if (agentForActions) {
        const processedMessages = newMessages.map((msg) => {
          if (msg.role === "assistant" && (!msg.actions || msg.actions.length === 0)) {
            return {
              ...msg,
              actions: generateMessageActions(agentForActions),
            }
          }
          return msg
        })
        setMessages(processedMessages)
      } else {
        setMessages(newMessages)
      }
    },
    [agent, generateMessageActions], // 依赖于当前的 agent 和 generateMessageActions
  )

  return {
    messages,
    detailContent,
    loading,
    error,
    fetchMessages,
    sendMessage,
    sendMessageWithChatId,
    handleMessageAction,
    viewDetail,
    clearMessages,
    setMessagesData,
  }
}

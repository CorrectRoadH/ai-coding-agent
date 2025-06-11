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

  const _generateStreamingResponse = useCallback(
    async (userContent: string, targetChatId: string, targetAgent: AgentType, currentMessages: ChatMessage[]) => {
      setLoading(true)
      setError(null)

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: userContent,
        role: "user",
        timestamp: new Date(),
      }

      const messagesWithUser = [...currentMessages, userMessage]
      setMessages(messagesWithUser)
      if (onUpdateChatMessages) {
        onUpdateChatMessages(targetChatId, messagesWithUser)
      }

      const assistantMessageId = (Date.now() + 1).toString()
      const placeholderAiResponse: ChatMessage = {
        id: assistantMessageId,
        content: "思考中...",
        role: "assistant",
        timestamp: new Date(),
        actions: [],
        detailContent: "",
      }

      setMessages((prevMessages) => [...prevMessages, placeholderAiResponse])

      const detail: DetailContent = {
        id: assistantMessageId,
        title: `${getAgentTitle(targetAgent)} 详情`,
        content: "",
      }
      setDetailContent(detail)

      let streamInterval: NodeJS.Timeout | undefined

      try {
        const fullDetailContent = generateDetailContent(targetAgent)
        const chunks = fullDetailContent.split(/(\s+)/)
        let streamedContent = ""

        streamInterval = setInterval(() => {
          if (chunks.length > 0) {
            const chunk = chunks.shift()!
            streamedContent += chunk
            setDetailContent({ ...detail, content: streamedContent })
          } else {
            clearInterval(streamInterval)

            const finalAiResponse: ChatMessage = {
              ...placeholderAiResponse,
              content: generateResponse(targetAgent, userContent),
              detailContent: fullDetailContent,
              actions: generateMessageActions(targetAgent),
            }

            setMessages((prevMessages) => {
              const updatedMessages = prevMessages.map((msg) => (msg.id === assistantMessageId ? finalAiResponse : msg))
              if (onUpdateChatMessages) {
                onUpdateChatMessages(targetChatId, updatedMessages)
              }
              return updatedMessages
            })
            setLoading(false)
          }
        }, 50)
      } catch (err) {
        if (streamInterval) clearInterval(streamInterval)
        const errorMessage = err instanceof Error ? err.message : "生成响应时出错"
        setError(errorMessage)
        const errorAiResponse: ChatMessage = {
          ...placeholderAiResponse,
          content: `错误: ${errorMessage}`,
        }
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg.id === assistantMessageId ? errorAiResponse : msg)),
        )
        setLoading(false)
      }
    },
    [getAgentTitle, generateMessageActions, onUpdateChatMessages],
  )

  // 发送消息
  const sendMessage = useCallback(
    async (content: string) => {
      if (!agent || !chatId) return null

      await _generateStreamingResponse(content, chatId, agent, messages)
      return null
    },
    [agent, chatId, messages, _generateStreamingResponse],
  )

  // 发送消息（支持直接传入chatId和指定agent类型）
  const sendMessageWithChatId = useCallback(
    async (content: string, targetChatId: string, targetAgent?: AgentType) => {
      const effectiveAgent = targetAgent || agent
      if (!effectiveAgent) return null

      const currentMessages = targetChatId === chatId ? messages : []
      await _generateStreamingResponse(content, targetChatId, effectiveAgent, currentMessages)
      return null
    },
    [agent, messages, chatId, _generateStreamingResponse],
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

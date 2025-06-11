"use client"

import { useState, useCallback } from "react"
import type { ChatHistoryItem, AgentType } from "@/types/agent"
import { useAgents } from "./useAgents" // 导入 useAgents hook

// 模拟初始数据，实际应用中可以从API获取
const initialChats: ChatHistoryItem[] = [
  {
    id: "1",
    title: "需求分析：AI-hub平台新增HTTP请求的异步方案",
    agent: "requirements",
    messages: [
      {
        id: "1-1",
        content: "AI-hub平台新增HTTP请求的异步方案,当前AI-hub平台工作流配置节点中，都是同步的操作，不支持异步调用的方式。 当前如果有通过HTTP请求执行的需要时间较久的生成式AI操作，如图生视频，约7-12分钟/个，目前只能在API接口上做同步的改造后硬等。 如果没有异步的解决方案会造成多个工作流阻塞挂起的情况，消耗大量机器资源。 希望可以快速接入异步的能力",
        role: "user",
        timestamp: new Date("2024-01-15T10:00:00"),
      },
      {
        id: "1-2",
        content: "我已经分析了您的需求，点击查看详细的需求分析文档。", // 简短回复
        role: "assistant",
        timestamp: new Date("2024-01-15T10:01:00"),
        actions: [], // 暂时留空，useMessages 会处理
        detailContent: `# 需求分析文档

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
   - 备份和恢复策略`, // 详细内容存储在这里
      },
    ],
  },
  {
    id: "2",
    title: "计划：AI-hub平台新增HTTP请求的异步方案",
    agent: "planning",
    messages: [
      {
        id: "2-1",
        content: "详细计划",
        role: "user",
        timestamp: new Date("2024-01-14T14:30:00"),
      },
      {
        id: "2-2",
        content: "我已经为您的项目制定了计划，点击查看详细的项目计划。", // 简短回复
        role: "assistant",
        timestamp: new Date("2024-01-14T14:31:00"),
        actions: [], // 暂时留空，useMessages 会处理
        detailContent: `# 项目计划

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
- 部署：Vercel, Docker`, // 详细内容存储在这里
      },
    ]
  }
]

export function useChats() {
  const [chats, setChats] = useState<ChatHistoryItem[]>(initialChats)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getAgentTitle } = useAgents() // 从 useAgents 导入

  // 获取所有对话
  const fetchChats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // 在这里可以替换为真实的API调用
      // const response = await fetch('/api/chats')
      // const data = await response.json()
      // setChats(data)

      // 模拟API调用延迟
      await new Promise((resolve) => setTimeout(resolve, 500))
      setChats(initialChats)
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取对话列表失败")
    } finally {
      setLoading(false)
    }
  }, [])

  // 创建新对话 - 乐观更新版本
  const createChatOptimistic = useCallback(
    (agent: AgentType, firstMessage: string) => {
      // 生成临时ID和标题
      const tempId = `temp-${Date.now()}`
      const agentTitle = getAgentTitle(agent) // 使用从 useAgents 导入的 getAgentTitle
      const title = `${agentTitle}：${firstMessage.slice(0, 10)}${firstMessage.length > 10 ? "..." : ""}`

      // 立即创建新对话并添加到列表顶部
      const newChat: ChatHistoryItem = {
        id: tempId,
        title,
        agent,
        messages: [],
      }

      setChats((prev) => [newChat, ...prev])
      return newChat
    },
    [getAgentTitle],
  )

  // 更新对话消息
  const updateChatMessages = useCallback((chatId: string, messages: any[]) => {
    setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, messages } : chat)))
  }, [])

  // 更新对话标题（当有了真实内容后）
  const updateChatTitle = useCallback((chatId: string, newTitle: string) => {
    setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, title: newTitle } : chat)))
  }, [])

  // 创建新对话（原版本，用于后台API调用）
  const createChat = useCallback(async (agent: AgentType, title: string) => {
    setLoading(true)
    setError(null)
    try {
      // 在这里可以替换为真实的API调用
      // const response = await fetch('/api/chats', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ agent, title })
      // })
      // const newChat = await response.json()

      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 300))
      const newChat: ChatHistoryItem = {
        id: Date.now().toString(),
        title,
        agent,
        messages: [],
      }

      setChats((prev) => [newChat, ...prev])
      return newChat
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建对话失败")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // 删除对话
  const deleteChat = useCallback(async (chatId: string) => {
    setLoading(true)
    setError(null)
    try {
      // 在这里可以替换为真实的API调用
      // await fetch(`/api/chats/${chatId}`, { method: 'DELETE' })

      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 300))
      setChats((prev) => prev.filter((chat) => chat.id !== chatId))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除对话失败")
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // 获取单个对话
  const getChat = useCallback(
    (chatId: string) => {
      return chats.find((chat) => chat.id === chatId) || null
    },
    [chats],
  )

  return {
    chats,
    loading,
    error,
    fetchChats,
    createChat,
    createChatOptimistic,
    updateChatMessages,
    updateChatTitle,
    deleteChat,
    getChat,
  }
}

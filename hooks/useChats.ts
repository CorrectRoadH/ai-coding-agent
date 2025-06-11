"use client"

import { useState, useCallback, useEffect } from "react"
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
        content: "AI-hub平台新增HTTP请求的异步方案...",
        role: "user",
        timestamp: new Date("2024-01-15T10:00:00"),
      },
      {
        id: "1-2",
        content: "我已经分析了您的需求，点击查看详细的需求分析文档。", // 简短回复
        role: "assistant",
        timestamp: new Date("2024-01-15T10:01:00"),
        actions: [], // 暂时留空，useMessages 会处理
        detailContent: `# 需求分析文档...`, // 详细内容存储在这里
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
        detailContent: `# 项目计划...`, // 详细内容存储在这里
      },
    ],
  },
]

export function useChats() {
  const [chats, setChats] = useState<ChatHistoryItem[]>(initialChats)
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getAgentTitle } = useAgents() // 从 useAgents 导入

  useEffect(() => {
    setIsMounted(true)
    try {
      const storedChats = localStorage.getItem("chats-history")
      if (storedChats) {
        const parsedChats = JSON.parse(storedChats).map((chat: ChatHistoryItem) => ({
          ...chat,
          messages: chat.messages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }))
        setChats(parsedChats)
      }
    } catch (error) {
      console.error("Error reading from localStorage", error)
      setChats(initialChats)
      localStorage.setItem("chats-history", JSON.stringify(initialChats))
    }
  }, [])

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("chats-history", JSON.stringify(chats))
    }
  }, [chats, isMounted])

  // 获取所有对话
  const fetchChats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // 模拟API调用延迟 - 当前使用localStorage，此函数可以暂时为空
      await new Promise((resolve) => setTimeout(resolve, 100))
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
      const title = `${agentTitle}：${firstMessage.slice(0, 10)}${
        firstMessage.length > 10 ? "..." : ""
      }`

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

"use client"

import { useState, useCallback } from "react"
import type { ChatMessage, AgentType, DetailContent, MessageAction } from "@/types/agent"
import { toast } from "sonner"
import { useAgents } from "./useAgents" // 导入 useAgents hook

const API_BASE_URL = "http://192.168.75.37:10001/api"

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
      await new Promise((resolve) => setTimeout(resolve, 500))
      setMessages([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取消息失败")
    } finally {
      setLoading(false)
    }
  }, [])

  const _generateStreamingResponse = useCallback(
    async (
      userContent: string,
      targetChatId: string,
      targetAgent: AgentType,
      currentMessages: ChatMessage[],
    ) => {
      setLoading(true)
      setError(null)

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: userContent,
        role: "user",
        timestamp: new Date(),
      }

      const messagesWithUser = [...currentMessages, userMessage]
      setMessages(messagesWithUser)
      onUpdateChatMessages?.(targetChatId, messagesWithUser)

      const assistantMessageId = crypto.randomUUID()
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

      try {
        const getApiEndpoint = (agentType: AgentType) => {
          switch (agentType) {
            case "planning":
              return `${API_BASE_URL}/plan`
            case "requirements":
              return `${API_BASE_URL}/requirements` // 假设的端点
            case "coding":
              return `${API_BASE_URL}/code` // 假设的端点
            default:
              throw new Error(`未知的 agent 类型: ${agentType}`)
          }
        }

        const res = await fetch(getApiEndpoint(targetAgent), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            conversation_id: targetChatId,
            message_id: assistantMessageId,
            question: userContent,
          }),
        })

        if (!res.ok) {
          throw new Error(`API 请求失败，状态码: ${res.status}`)
        }
        if (!res.body) {
          throw new Error("API 未返回有效响应体")
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        let streamedContent = ""

        const processStream = async () => {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\\n")
            buffer = lines.pop() || ""

            for (const line of lines) {
              if (line.startsWith("data:")) {
                const jsonStr = line.substring(5).trim()
                if (jsonStr) {
                  const data = JSON.parse(jsonStr)

                  const updateAssistantMessage = (content: string) => {
                    setMessages((prev) =>
                      prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content } : msg)),
                    )
                  }

                  switch (data.event) {
                    case "query_database":
                      updateAssistantMessage("正在查询数据库...")
                      break
                    case "query_context":
                      updateAssistantMessage("正在查询上下文...")
                      break
                    case "agent_call":
                      updateAssistantMessage("正在调用 Agent...")
                      break
                    case "plan_message":
                    case "requirements_message":
                    case "coding_message":
                      if (data.detail) {
                        streamedContent += data.detail
                        setDetailContent({ ...detail, content: streamedContent })
                      }
                      break
                    case "message_end":
                      reader.cancel()
                      let finalContent = streamedContent
                      if (targetAgent === "planning") {
                        try {
                          const parsedJson = JSON.parse(streamedContent)
                          finalContent = `\`\`\`json\n${JSON.stringify(parsedJson, null, 2)}\n\`\`\``
                        } catch (e) {
                          console.error("解析 planning JSON 失败", e)
                          finalContent = `\`\`\`\n${streamedContent}\n\`\`\``
                        }
                      }
                      setDetailContent({ ...detail, content: finalContent })

                      const finalAiResponse: ChatMessage = {
                        ...placeholderAiResponse,
                        content: generateResponse(targetAgent, userContent),
                        detailContent: finalContent,
                        actions: generateMessageActions(targetAgent),
                      }

                      setMessages((prev) => {
                        const updated = prev.map((msg) =>
                          msg.id === assistantMessageId ? finalAiResponse : msg,
                        )
                        onUpdateChatMessages?.(targetChatId, updated)
                        return updated
                      })
                      setLoading(false)
                      return
                  }
                }
              }
            }
          }
        }
        await processStream()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "生成响应时出错"
        setError(errorMessage)
        const errorAiResponse: ChatMessage = {
          ...placeholderAiResponse,
          content: `错误: ${errorMessage}`,
        }
        setMessages((prev) => prev.map((msg) => (msg.id === assistantMessageId ? errorAiResponse : msg)))
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

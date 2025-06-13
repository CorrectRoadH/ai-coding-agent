"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { fetchEventSource, type EventSourceMessage } from "@microsoft/fetch-event-source"
import type { ChatMessage, AgentType, DetailContent, MessageAction, Step } from "@/types/agent"
import { toast } from "sonner"
import { useAgents } from "./useAgents" // 导入 useAgents hook
import * as streamingjson from "streaming-json"

const API_BASE_URL = "http://192.168.75.37:10002/api"

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

function getInitialSteps(agent: AgentType): Step[] {
  switch (agent) {
    case "requirements":
      return [
        { id: "query_database", title: "查询知识库", status: "pending" },
        { id: "query_context", title: "查询上下文", status: "pending" },
        { id: "agent_call", title: "调用 Agent", status: "pending" },
        { id: "requirements_message", title: "生成需求", status: "pending" },
      ]
    case "planning":
      return [
        { id: "query_database", title: "查询知识库", status: "pending" },
        { id: "query_context", title: "查询上下文", status: "pending" },
        { id: "agent_call", title: "调用 Agent", status: "pending" },
        { id: "plan_message", title: "生成计划", status: "pending" },
      ]
    case "coding":
      return [
        { id: "query_database", title: "查询知识库", status: "pending" },
        { id: "query_context", title: "查询上下文", status: "pending" },
        { id: "agent_call", title: "调用 Agent", status: "pending" },
        { id: "coding_message", title: "生成代码", status: "pending" },
      ]
    default:
      return []
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
  const isStreaming = useRef(false) // 使用 useRef 跟踪流状态
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      // 组件卸载时，中止任何正在进行的请求
      if (abortControllerRef.current) {
        console.log("组件卸载，中止请求...")
        abortControllerRef.current.abort()
      }
    }
  }, []) // 空依赖数组确保只在挂载和卸载时运行

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
      console.log("targetAgent", targetAgent)
      if (isStreaming.current) {
        console.warn("一个流式响应已经在进行中，已阻止新的请求。")
        return
      }
      isStreaming.current = true
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

      const initialSteps = getInitialSteps(targetAgent)
      const detail: DetailContent = {
        id: assistantMessageId,
        title: `${getAgentTitle(targetAgent)} 过程`,
        content: initialSteps,
      }
      setDetailContent(detail)

      try {
        const getApiEndpoint = (agentType: AgentType) => {
          switch (agentType) {
            case "planning":
              return `${API_BASE_URL}/plan`
            case "requirements":
              return `${API_BASE_URL}/plan` // 假设的端点
            case "coding":
              return `${API_BASE_URL}/code` // 假设的端点
            default:
              throw new Error(`未知的 agent 类型: ${agentType}`)
          }
        }

        let streamedContent = ""
        // 为 JSON 流新增一个原始缓冲区，用于去重处理
        let rawJsonBuffer = ""

        // 工具函数：计算 newChunk 中与 prevBuffer 重叠的最长前缀长度，
        // 仅返回去掉重叠部分后的新增内容。
        const getNonOverlappingPart = (prev: string, next: string) => {
          const maxOverlap = Math.min(prev.length, next.length)
          for (let i = maxOverlap; i > 0; i--) {
            if (prev.slice(-i) === next.slice(0, i)) {
              return next.slice(i)
            }
          }
          return next
        }

        const ctrl = new AbortController()
        abortControllerRef.current = ctrl
        let lexer: any
        if (targetAgent === "planning" || targetAgent === "coding") {
          lexer = new streamingjson.Lexer()
        }
        

        await fetchEventSource(getApiEndpoint(targetAgent), {
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
          signal: ctrl.signal,

          onopen: async (response) => {
            if (!response.ok) {
              ctrl.abort()
              throw new Error(`API 请求失败，状态码: ${response.status}`)
            }
          },

          onmessage: (event: EventSourceMessage) => {
            if (event.event === "message_end") {
              ctrl.abort() // 正常结束时关闭连接
              return
            }
            console.log("event", event)
            if (event.data) {
              try {
                const data = JSON.parse(event.data)
                const eventId = data.event

                const getEventText = (event: string) => {
                  switch (event) {
                    case "query_database":
                      return "正在查询知识库..."
                    case "query_context":
                      return "正在查询上下文..."
                    case "agent_call":
                      return "正在调用 Agent..."
                    case "plan_message":
                      return "正在生成计划..."
                    case "requirements_message":
                      return "正在生成需求..."
                    case "coding_message":
                      return "正在生成代码..."
                    default:
                      return "思考中..."
                  }
                }

                // 更新左侧聊天气泡里的消息
                setMessages((prev) =>
                  prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: getEventText(eventId) } : msg)),
                )

                // 更新右侧详情面板的步骤状态
                setDetailContent((prev) => {
                  if (!prev || !Array.isArray(prev.content)) return prev

                  let eventFound = false
                  const updatedSteps = (prev.content as Step[]).map((step) => {
                    if (eventFound) {
                      return step // 未来的步骤保持不变
                    }
                    if (step.id === eventId) {
                      eventFound = true
                      const isStreamableJsonEvent =
                        (eventId === "plan_message" || eventId === "coding_message") && lexer

                      const isAgentCall = eventId === "query_database" || eventId === "query_context" || eventId === "agent_call"
                      if (data.content) {
                        if (isAgentCall) {
                          streamedContent = JSON.stringify(data.content)
                          return { ...step, status: "in_progress" as const, content: streamedContent }
                        }
                        if (isStreamableJsonEvent) {
                          try {
                            // 先计算新增的（非重复）部分再追加到 lexer
                            const uniquePart = getNonOverlappingPart(rawJsonBuffer, data.content)
                            if (uniquePart) {
                              rawJsonBuffer += uniquePart
                              lexer.AppendString(uniquePart)
                            }

                            try {
                              // 如果 JSON 已经完整，获取其完整内容
                              const completed = lexer.CompleteJSON()
                              if (completed) {
                                streamedContent = JSON.parse(completed)
                              }
                            } catch {
                              // JSON 仍未完整，忽略
                            }
                          } catch (e) {
                            console.log("JSON 解析失败，等待更多数据...", e)
                          }
                        } else {
                          // 对于普通文本流，继续累加
                          streamedContent += data.content
                        }
                      }
                      return { ...step, status: "in_progress" as const, content: streamedContent }
                    }
                    return { ...step, status: "completed" as const }
                  })

                  return { ...prev, content: updatedSteps }
                })
              } catch (e) {
                console.error("解析 SSE 数据失败", e)
              }
            }
          },

          onclose: () => {
            // 流关闭后处理最终内容
            let finalContentForMessage: string | object = streamedContent
            if (targetAgent === "planning" || targetAgent === "coding") {
              try {
                finalContentForMessage = JSON.parse(streamedContent)
              } catch (e) {
                console.error("Final JSON parsing failed", e)
                finalContentForMessage = streamedContent
              }
            }

            // 更新最终的详情内容和步骤状态
            setDetailContent((prev) => {
              if (!prev || !Array.isArray(prev.content)) return prev

              const finalSteps = (prev.content as Step[]).map((step) => {
                const isContentStep =
                  (targetAgent === "planning" && step.id === "plan_message") ||
                  (targetAgent === "coding" && step.id === "coding_message") ||
                  (targetAgent === "requirements" && step.id === "requirements_message")

                let finalStepContent = step.content
                if (isContentStep) {
                  finalStepContent = finalContentForMessage
                }

                return {
                  ...step,
                  status: step.status !== "pending" ? ("completed" as const) : ("pending" as const),
                  content: finalStepContent,
                }
              })
              return { ...prev, content: finalSteps }
            })

            const finalAiResponse: ChatMessage = {
              ...placeholderAiResponse,
              content: generateResponse(targetAgent, userContent),
              detailContent: finalContentForMessage, // 消息中存储最终产物
              actions: generateMessageActions(targetAgent),
            }

            setMessages((prev) => {
              const updated = prev.map((msg) => (msg.id === assistantMessageId ? finalAiResponse : msg))
              onUpdateChatMessages?.(targetChatId, updated)
              return updated
            })
            setLoading(false)
            isStreaming.current = false // 重置流状态
            abortControllerRef.current = null
          },

          onerror: (err) => {
            // fetchEventSource 会自动重试，只有在这里抛出错误才会真正停止
            // 如果我们不希望它重试，就在这里抛出错误
            // 否则可以只记录错误，让它继续
            ctrl.abort() // 出现错误时停止
            isStreaming.current = false // 重置流状态
            abortControllerRef.current = null
            throw err // 抛出错误以触发下面的 catch 块
          },
        })
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          console.log("请求被成功中止。")
        } else {
          const errorMessage = err instanceof Error ? err.message : "生成响应时出错"
          setError(errorMessage)
          const errorAiResponse: ChatMessage = {
            ...placeholderAiResponse,
            content: `错误: ${errorMessage}`,
          }
          setMessages((prev) => prev.map((msg) => (msg.id === assistantMessageId ? errorAiResponse : msg)))
        }
        setLoading(false)
        isStreaming.current = false // 发生错误时也要重置
        abortControllerRef.current = null
      }
    },
    [getAgentTitle, generateMessageActions, onUpdateChatMessages],
  )

  // 发送消息
  const sendMessage = useCallback(
    async (content: string) => {
      console.log("sendMessage", agent, chatId)

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
            const contentToCopy =
              typeof message.detailContent === "object"
                ? JSON.stringify(message.detailContent, null, 2)
                : message.detailContent
            navigator.clipboard.writeText(contentToCopy).then(() => {
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
            const contentForNextStage =
              typeof message.detailContent === "object"
                ? JSON.stringify(message.detailContent, null, 2)
                : message.detailContent

            console.log(
              "Calling onNextStage with:",
              nextAgent,
              contentForNextStage.substring(0, 50) + "...",
            )
            onNextStage(nextAgent, contentForNextStage)
          }
          break

        case "export":
          if (agent === "coding" && message.role === "assistant" && message.detailContent) {
            const contentToExport =
              typeof message.detailContent === "object"
                ? JSON.stringify(message.detailContent, null, 2)
                : message.detailContent
            const blob = new Blob([contentToExport], { type: "text/markdown" })
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

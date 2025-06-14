"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { fetchEventSource, type EventSourceMessage } from "@microsoft/fetch-event-source"
import type { ChatMessage, AgentType, DetailContent, MessageAction, Step } from "@/types/agent"
import { toast } from "sonner"
import { useAgents } from "./useAgents" // 导入 useAgents hook
import * as streamingjson from "streaming-json"
import { v4 as uuidv4 } from "uuid"

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
        id: uuidv4(),
        content: userContent,
        role: "user",
        timestamp: new Date(),
      }

      const messagesWithUser = [...currentMessages, userMessage]
      setMessages(messagesWithUser)
      onUpdateChatMessages?.(targetChatId, messagesWithUser)

      const assistantMessageId = uuidv4()
      const placeholderAiResponse: ChatMessage = {
        id: assistantMessageId,
        content: "思考中...",
        role: "assistant",
        timestamp: new Date(),
        actions: [],
        detailContent: undefined, // Initially no detail content
      }

      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, placeholderAiResponse])

      // 初始化右侧详情面板
      const detail: DetailContent = {
        id: assistantMessageId,
        title: `${getAgentTitle(targetAgent)} 过程`,
        content: "", // Initially no content
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
        let lastParsedJson: any = null

        const ctrl = new AbortController()
        abortControllerRef.current = ctrl
        const lexer = new streamingjson.Lexer()
        
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

          onopen: async (response: Response) => {
            if (!response.ok) {
              ctrl.abort()
              throw new Error(`API 请求失败，状态码: ${response.status}`)
            }
          },

          onmessage: (event: EventSourceMessage) => {
            if (event.event === "message_end" || event.data === "[DONE]") {
              ctrl.abort() // 正常结束时关闭连接
              setLoading(false)
              isStreaming.current = false // 重置流状态
              abortControllerRef.current = null
              return
            }
            
            if (event.data) {
              try {
                const data = JSON.parse(event.data)
                
                // 更新左侧聊天气泡里的消息
                setMessages((prev: ChatMessage[]) =>
                  prev.map((msg: ChatMessage) => (msg.id === assistantMessageId ? { ...msg, content: "正在生成..." } : msg)),
                )

                if (data.content) {
                  streamedContent += data.content
                  lexer.AppendString(data.content)

                  try {
                    lastParsedJson = JSON.parse(lexer.CompleteJSON())
                  } catch (e) {
                    // Not a valid JSON yet, wait for more chunks.
                  }
                }
                
                // 更新右侧详情面板
                setDetailContent((prev: DetailContent | null) => {
                  if (!prev) return prev
                  // If we have a valid JSON, use it. Otherwise, keep the last valid one.
                  const contentToShow = lastParsedJson || prev.content
                  return { ...prev, content: contentToShow }
                })

              } catch (e) {
                console.error("解析 SSE 数据失败", e)
              }
            }
          },

          onclose: () => {
            // 流关闭后处理最终内容
            let finalContentForMessage: string | object = streamedContent
            try {
              finalContentForMessage = JSON.parse(streamedContent as string)
            } catch (e) {
              console.error("Final JSON parsing failed, using raw string.", e)
              finalContentForMessage = streamedContent
            }

            // HACK: 尝试修复来自服务器的双重编码JSON字符串。
            // 如果内容是一个可以被解析为另一个字符串的字符串，就解开它。
            if (typeof finalContentForMessage === "string") {
              try {
                const parsed = JSON.parse(finalContentForMessage)
                if (typeof parsed === "string") {
                  finalContentForMessage = parsed
                }
              } catch (e) {
                // 如果字符串不是有效的JSON编码字符串（例如，原始的markdown），这是预期的行为
              }
            }

            // 更新最终的详情内容和步骤状态，同时把最终步骤保存下来，稍后存入消息
            const finalAiResponse: ChatMessage = {
              ...placeholderAiResponse,
              content: generateResponse(targetAgent, userContent),
              // 将完整步骤数组存入消息，方便后续"查看详情"
              detailContent: finalContentForMessage,
              actions: generateMessageActions(targetAgent),
            }

            setMessages((prev: ChatMessage[]) => {
              const updated = prev.map((msg: ChatMessage) => (msg.id === assistantMessageId ? finalAiResponse : msg))
              onUpdateChatMessages?.(targetChatId, updated)
              return updated
            })
            setLoading(false)
            isStreaming.current = false // 重置流状态
            abortControllerRef.current = null
          },

          onerror: (err: any) => {
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
          setMessages((prev: ChatMessage[]) => prev.map((msg: ChatMessage) => (msg.id === assistantMessageId ? errorAiResponse : msg)))
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
      const message = messages.find((m: ChatMessage) => m.id === messageId)
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
            // 当 detailContent 为步骤数组时，提取最后一步的 content 作为下一阶段输入
            let payload: string | object | undefined = undefined

            if (Array.isArray(message.detailContent)) {
              const lastStep = message.detailContent[message.detailContent.length - 1]
              payload = lastStep?.content
            } else {
              payload = message.detailContent
            }

            const contentForNextStage =
              typeof payload === "object" ? JSON.stringify(payload, null, 2) : (payload ?? "")

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

        case "link":
          if (action.href) {
            window.open(action.href, "_blank")
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
      const message = messages.find((m: ChatMessage) => m.id === messageId)
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

"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import AgentSelection from "@/components/agent-selection"
import ChatInterface from "@/components/chat-interface"
import DetailsPanel from "@/components/details-panel"
import ResizablePanel from "@/components/resizable-panel"
import { useChats } from "@/hooks/useChats"
import { useMessages } from "@/hooks/useMessages"
import type { AgentType, MessageAction } from "@/types/agent"

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  // 使用自定义hook获取对话列表
  const {
    chats,
    loading: chatsLoading,
    error: chatsError,
    createChat,
    createChatOptimistic,
    updateChatMessages,
    updateChatTitle,
    getChat,
  } = useChats()

  // 处理进入下一阶段 - 修复：传递正确的 agent 类型
  const handleNextStage = async (nextAgent: AgentType, initialMessage?: string) => {
    console.log("handleNextStage called with:", nextAgent, initialMessage ? "with message" : "no message")

    // 1. 立即清除当前消息状态
    clearMessages()

    // 2. 创建新对话
    const firstMessageContent = initialMessage || `开始 ${nextAgent} 阶段`
    const newChat = createChatOptimistic(nextAgent, firstMessageContent)
    console.log("Created new chat:", newChat)

    // 3. 切换到新对话
    setSelectedAgent(nextAgent)
    setSelectedChatId(newChat.id)

    // 4. 再次确保消息被清空
    setTimeout(() => {
      clearMessages()
    }, 0)

    // 5. 如果有初始消息，发送它（传递正确的 agent 类型）
    if (initialMessage) {
      setTimeout(async () => {
        console.log("Sending initial message to new chat:", newChat.id, "with agent:", nextAgent)
        // 修复：传递 nextAgent 作为第三个参数
        await sendMessageWithChatId(initialMessage, newChat.id, nextAgent)
      }, 100)
    }
  }

  // 使用自定义hook获取消息
  const {
    messages,
    detailContent,
    loading: messagesLoading,
    error: messagesError,
    sendMessage,
    sendMessageWithChatId,
    handleMessageAction: processMessageAction,
    viewDetail,
    clearMessages,
    setMessagesData,
  } = useMessages(selectedChatId, selectedAgent, updateChatMessages, handleNextStage)

  // 处理新建对话
  const handleNewChat = () => {
    setSelectedAgent(null)
    setSelectedChatId(null)
    clearMessages()
  }

  // 处理选择Agent
  const handleAgentSelect = async (agent: AgentType) => {
    setSelectedAgent(agent)
    setSelectedChatId(null)
    clearMessages()
  }

  // 处理发送消息 - 修复新建对话时的消息发送问题
  const handleSendMessage = async (content: string) => {
    if (!selectedAgent) return

    // 如果是新对话（没有选中的chatId），先创建对话
    let currentChatId = selectedChatId
    if (!currentChatId) {
      // 乐观更新：立即创建新对话并添加到列表
      const newChat = createChatOptimistic(selectedAgent, content)
      currentChatId = newChat.id
      setSelectedChatId(currentChatId)

      // 直接调用消息发送，传入新的 chatId 和正确的 agent
      await sendMessageWithChatId(content, currentChatId, selectedAgent)
    } else {
      // 使用现有的对话ID发送消息
      await sendMessage(content)
    }
  }

  // 处理消息操作
  const handleMessageAction = (messageId: string, action: MessageAction) => {
    console.log("handleMessageAction called:", messageId, action)
    processMessageAction(messageId, action)
  }

  // 处理选择对话 - 修复历史对话操作按钮问题
  const handleChatSelect = (chatId: string) => {
    const selectedChat = getChat(chatId)
    if (selectedChat) {
      setSelectedChatId(chatId)
      setSelectedAgent(selectedChat.agent)
      // 传递历史对话的 agent 类型给 setMessagesData
      setMessagesData(selectedChat.messages, selectedChat.agent)

      // 如果有历史消息且最后一条是助手消息且有详情，则显示详情
      const lastMessage = selectedChat.messages[selectedChat.messages.length - 1]
      if (lastMessage && lastMessage.role === "assistant" && lastMessage.hasDetail) {
        viewDetail(lastMessage.id)
      }
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        chatHistory={chats}
        selectedChatId={selectedChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        loading={chatsLoading}
      />

      <div className="flex-1 flex flex-col border-x border-gray-200 bg-white">
        {selectedAgent ? (
          <ChatInterface
            agent={selectedAgent}
            messages={messages}
            onSendMessage={handleSendMessage}
            onMessageAction={handleMessageAction}
            onBack={handleNewChat}
            loading={messagesLoading}
          />
        ) : (
          <AgentSelection onAgentSelect={handleAgentSelect} />
        )}
      </div>

      <ResizablePanel defaultWidth={320} minWidth={280} maxWidth={600} side="right">
        <DetailsPanel detailContent={detailContent} />
      </ResizablePanel>
    </div>
  )
}

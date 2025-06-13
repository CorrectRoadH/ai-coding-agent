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
    deleteChat,
    getChat,
  } = useChats()

  // 处理进入下一阶段 - 修复：传递正确的 agent 类型
  const handleNextStage = (nextAgent: AgentType, initialMessage?: string) => {
    // 1. 立即清除当前消息状态
    clearMessages()

    // 2. 创建新对话并发送初始消息
    const firstMessageContent = initialMessage || `开始 ${nextAgent} 阶段`
    const newChat = createChatOptimistic(
      nextAgent,
      firstMessageContent,
      sendMessageWithChatId,
    )

    // 3. 切换到新对话
    setSelectedAgent(nextAgent)
    setSelectedChatId(newChat.id)
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
      // 乐观更新：立即创建新对话并发送消息
      const newChat = createChatOptimistic(
        selectedAgent,
        content,
        sendMessageWithChatId,
      )
      currentChatId = newChat.id
      setSelectedChatId(currentChatId)
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
      // 切换对话时，先清空当前消息和详细内容
      clearMessages()

      setSelectedChatId(chatId)
      setSelectedAgent(selectedChat.agent)
      // 传递历史对话的 agent 类型给 setMessagesData
      setMessagesData(selectedChat.messages, selectedChat.agent)

      // 移除自动显示最后一个消息详情的逻辑，以确保右侧面板被清空
      // const lastMessage = selectedChat.messages[selectedChat.messages.length - 1]
      // if (lastMessage && lastMessage.role === "assistant" && lastMessage.detailContent) {
      //   viewDetail(lastMessage.id)
      // }
    }
  }

  // 新增：处理删除对话
  const handleDeleteChat = async (chatId: string) => {
    const success = await deleteChat(chatId)
    if (success && selectedChatId === chatId) {
      // 如果删除的是当前选中的对话，则返回新建对话界面
      handleNewChat()
    }
    // 如果删除的不是当前选中的对话，侧边栏会自动更新，无需额外操作
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        chatHistory={chats}
        selectedChatId={selectedChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
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

      <ResizablePanel defaultWidth={600} minWidth={280} maxWidth={800} side="right">
        <DetailsPanel detailContent={detailContent} />
      </ResizablePanel>
    </div>
  )
}

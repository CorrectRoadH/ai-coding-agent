"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AgentType, ChatMessage, MessageAction } from "@/types/agent"
import { ArrowLeft, Send, Loader2, FileText, Copy, ArrowRight, Code, Download } from "lucide-react"
import { useAgents } from "@/hooks/useAgents"

interface ChatInterfaceProps {
  agent: AgentType
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  onMessageAction: (messageId: string, action: MessageAction) => void
  onBack: () => void
  loading?: boolean
}

// 图标映射
const iconMap = {
  FileText,
  Copy,
  ArrowRight,
  Code,
  Download,
}

export default function ChatInterface({
  agent,
  messages,
  onSendMessage,
  onMessageAction,
  onBack,
  loading = false,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { getAgentTitle } = useAgents()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isSubmitting) {
      setIsSubmitting(true)
      await onSendMessage(input.trim())
      setInput("")
      setIsSubmitting(false)
    }
  }

  const renderActionButton = (action: MessageAction, messageId: string) => {
    const IconComponent = iconMap[action.icon as keyof typeof iconMap]

    return (
      <Button
        key={action.id}
        variant={action.variant as any}
        size="sm"
        className="text-xs relative" // 添加 relative 以便定位徽章
        onClick={() => onMessageAction(messageId, action)}
        disabled={action.disabled} // 根据 action.disabled 禁用按钮
      >
        {IconComponent && <IconComponent className="h-3 w-3 mr-1" />}
        {action.label}
        {action.disabled && (
          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-green-500 text-white rounded-full">
            敬请期待
          </span>
        )}
      </Button>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">{getAgentTitle(agent)}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>开始与 {getAgentTitle(agent)} 对话</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="mb-2">{message.content}</div>
                {message.actions && message.actions.length > 0 && message.role === "assistant" && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-200">
                    {message.actions.map((action) => renderActionButton(action, message.id))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`向${getAgentTitle(agent)}发送消息...`}
            className="flex-1"
            disabled={isSubmitting || loading}
          />
          <Button type="submit" size="icon" disabled={isSubmitting || loading || !input.trim()}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}

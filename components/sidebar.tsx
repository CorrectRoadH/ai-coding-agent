"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2 } from "lucide-react"
import type { ChatHistoryItem } from "@/types/agent"

interface SidebarProps {
  chatHistory: ChatHistoryItem[]
  selectedChatId: string | null
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
  loading?: boolean
}

export default function Sidebar({
  chatHistory,
  selectedChatId,
  onChatSelect,
  onNewChat,
  loading = false,
}: SidebarProps) {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">AI Coding Agent</h2>
      </div>

      <div className="p-4">
        <Button className="w-full flex items-center gap-2" variant="outline" onClick={onNewChat}>
          <PlusCircle className="h-4 w-4" />
          <span>新建对话</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <h3 className="px-2 py-1 text-sm font-medium text-gray-500">历史对话</h3>
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="mt-2 space-y-1">
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedChatId === chat.id ? "bg-gray-200 text-gray-900" : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => onChatSelect(chat.id)}
              >
                {chat.title}
              </button>
            ))}
            {chatHistory.length === 0 && <div className="text-center py-4 text-gray-500 text-sm">暂无历史对话</div>}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-300"></div>
          <div className="text-sm font-medium">用户名</div>
        </div>
      </div>
    </div>
  )
}

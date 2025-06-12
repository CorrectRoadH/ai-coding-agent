export type AgentType = "requirements" | "planning" | "coding"

export interface ChatMessage {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  actions?: MessageAction[]
  detailContent?: string | object // 添加详细内容字段, 支持对象
}

export interface MessageAction {
  id: string
  label: string
  type: "detail" | "copy" | "next-stage" | "export"
  variant?: "default" | "outline" | "secondary"
  icon?: string
  disabled?: boolean
}

export interface Step {
  id: string
  title: string
  status: "pending" | "in_progress" | "completed" | "error"
  content?: any
}

export interface DetailContent {
  id: string
  title: string
  content: string | object | Step[]
}

export interface ChatHistoryItem {
  id: string
  title: string
  agent: AgentType
  messages: ChatMessage[]
}

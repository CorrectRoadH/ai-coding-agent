import type { DetailContent } from "@/types/agent"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"

interface DetailsPanelProps {
  detailContent: DetailContent | null
}

export default function DetailsPanel({ detailContent }: DetailsPanelProps) {
  return (
    <div className="bg-gray-50 border-l border-gray-200 flex flex-col h-full w-full">
      {detailContent ? (
        <>
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">{detailContent.title}</h2>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="prose prose-sm max-w-none">
              <pre>
                <code>{detailContent.content}</code>
              </pre>
            </div>
          </ScrollArea>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 p-4 text-center">
          <p>选择一个 Agent 并开始对话，详细内容将显示在这里</p>
        </div>
      )}
    </div>
  )
}

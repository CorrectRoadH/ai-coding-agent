import type { DetailContent } from "@/types/agent"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"
import { useEffect, useRef } from "react"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"

interface DetailsPanelProps {
  detailContent: DetailContent | null
}

export default function DetailsPanel({ detailContent }: DetailsPanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.parentElement?.querySelector(
        '[data-radix-scroll-area-viewport]',
      )
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }, [detailContent?.content])

  return (
    <div className="bg-gray-50 border-l border-gray-200 flex flex-col h-full w-full">
      {detailContent ? (
        <>
          <div className="flex p-4 h-20 border-b border-gray-200">
            <h2 className="my-auto text-lg font-semibold">{detailContent.title}</h2>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="prose prose-sm max-w-none" ref={scrollAreaRef}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {detailContent.content}
              </ReactMarkdown>
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

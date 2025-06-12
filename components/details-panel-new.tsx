import type { DetailContent } from "@/types/agent"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useRef, ElementRef } from "react"

interface DetailsPanelProps {
  detailContent: DetailContent | null
}

export default function DetailsPanel({ detailContent }: DetailsPanelProps) {
  const scrollAreaRef = useRef<ElementRef<typeof ScrollArea>>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight
        }, 0)
      }
    }
  }, [detailContent?.content])

  return (
    <div className="bg-gray-50 border-l border-gray-200 flex flex-col h-full w-full">
      {detailContent?.content && detailContent.content.length > 0 ? (
        <>
          <div className="flex p-4 h-20 border-b border-gray-200">
            <h2 className="my-auto text-lg font-semibold">{detailContent.title}</h2>
          </div>
          <ScrollArea className="flex-1 p-4 h-full" ref={scrollAreaRef}>
            <pre className="text-sm whitespace-pre-wrap break-all">
              {detailContent.content}
            </pre>
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
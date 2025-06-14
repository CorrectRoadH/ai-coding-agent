import type { DetailContent } from "@/types/agent"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useRef, ElementRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import GenericDisplay from "./generic-display"

interface DetailsPanelProps {
  detailContent: DetailContent | null
}

export default function DetailsPanel({ detailContent }: DetailsPanelProps) {
  const scrollAreaRef = useRef<ElementRef<typeof ScrollArea>>(null)

  const content = detailContent?.content
  const isObject = typeof content === "object" && content !== null
  const isString = typeof content === "string"

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight
        }, 100)
      }
    }
  }, [detailContent])

  const hasContent = detailContent && (isObject || (isString && (content as string).length > 0))

  return (
    <div className="bg-white border-l border-gray-200 flex flex-col h-full w-full">
      {hasContent ? (
        <>
          <div className="flex p-4 h-20 border-b border-gray-200">
            <h2 className="my-auto text-lg font-semibold">{detailContent.title}</h2>
          </div>
          <ScrollArea className="flex-1 h-full" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
              {isObject ? (
                <GenericDisplay data={content} />
              ) : isString ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content as string}</ReactMarkdown>
              ) : null}
            </div>
          </ScrollArea>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 p-4 text-center bg-gray-50">
          <p>选择一个 Agent 并开始对话，详细内容将显示在这里</p>
        </div>
      )}
    </div>
  )
}

import type { DetailContent, Step } from "@/types/agent"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useRef, ElementRef } from "react"
import PlanDisplay from "./plan-display"
import StepDisplay from "./step-display"

interface DetailsPanelProps {
  detailContent: DetailContent | null
}

export default function DetailsPanel({ detailContent }: DetailsPanelProps) {
  const scrollAreaRef = useRef<ElementRef<typeof ScrollArea>>(null)

  const isSteps = Array.isArray(detailContent?.content)
  const isPlan = typeof detailContent?.content === "object" && detailContent?.content !== null && !isSteps

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight
            
        }, 100)
      }
    }
  }, [detailContent, isSteps, isPlan])

  const hasContent = detailContent && (isSteps || isPlan || (typeof detailContent.content === 'string' && detailContent.content.length > 0));

  return (
    <div className="bg-white border-l border-gray-200 flex flex-col h-full w-full">
      {hasContent ? (
        <>
          <div className="flex p-4 h-20 border-b border-gray-200">
            <h2 className="my-auto text-lg font-semibold">{detailContent.title}</h2>
          </div>
          <ScrollArea className="flex-1 h-full" ref={scrollAreaRef}>
             <div className="p-4 space-y-4">
              {isSteps ? (
                (detailContent?.content as Step[]).map((step, index) => (
                  <StepDisplay key={index} step={step} />
                ))
              ) : isPlan ? (
                <PlanDisplay plan={detailContent.content as any} />
              ) : (
                <pre className="prose prose-sm max-w-none whitespace-pre-wrap break-words">
                  {typeof detailContent.content === "string" ? detailContent.content : ""}
                </pre>
              )}
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

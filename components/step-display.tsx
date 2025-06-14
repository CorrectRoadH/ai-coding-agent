import type { Step } from "@/types/agent"
import { CheckCircle, Circle, Loader } from "./icons"
import PlanDisplay from "./plan-display"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface StepDisplayProps {
  step: Step
}

const StepDisplay = ({ step }: StepDisplayProps) => {
  const getIcon = () => {
    switch (step.status) {
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "in_progress":
        return <Loader className="h-6 w-6 animate-spin text-blue-500" />
      case "pending":
      default:
        return <Circle className="h-6 w-6 text-gray-300" />
    }
  }

  // 如果内容被 JSON.stringify 包裹（例如 "# 标题\n内容"），尝试解析以恢复原始字符串，方便正确渲染 Markdown。
  let processedContent: unknown = step.content
  if (typeof processedContent === "string") {
    try {
      const parsed = JSON.parse(processedContent)
      if (typeof parsed === "string") {
        processedContent = parsed
      }
    } catch {
      // 解析失败说明不是被 JSON.stringify 包裹的字符串，保持原样即可。
    }
  }

  const isPlan = typeof processedContent === "object" && processedContent !== null
  const isCode = typeof processedContent === "string" && processedContent.startsWith("```")
  const hasSimpleContent = typeof processedContent === "string" && !isCode

  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-grow pt-0.5">
        <p
          className={cn(
            "font-semibold",
            step.status === "pending" && "text-gray-400",
            step.status === "completed" && "text-gray-800",
            step.status === "in_progress" && "text-blue-600",
          )}
        >
          {step.title}
        </p>
        {Boolean(processedContent) && (
          <div className="mt-2 rounded-lg border bg-gray-50 p-4">
            {isPlan ? (
              <PlanDisplay plan={processedContent as any} />
            ) : typeof processedContent === 'string' ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{processedContent}</ReactMarkdown>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default StepDisplay 
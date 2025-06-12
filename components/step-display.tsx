import type { Step } from "@/types/agent"
import { CheckCircle, Circle, Loader } from "./icons"
import PlanDisplay from "./plan-display"
import { cn } from "@/lib/utils"

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

  const isPlan = typeof step.content === "object" && step.content !== null
  const isCode = typeof step.content === "string" && step.content.startsWith("```")
  const hasSimpleContent = typeof step.content === "string" && !isCode

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
        {step.content && (
          <div className="mt-2 rounded-lg border bg-gray-50 p-4">
            {isPlan ? (
              <PlanDisplay plan={step.content} />
            ) : isCode ? (
                <pre className="prose prose-sm max-w-none whitespace-pre-wrap break-words">{step.content}</pre>
            ) : hasSimpleContent ? (
                <p className="text-sm text-gray-600">{step.content}</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default StepDisplay 
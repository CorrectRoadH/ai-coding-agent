import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ListTodo, BrainCircuit, Flag, TestTube2 } from "lucide-react"

// 定义从父组件接收的 plan 对象的类型
interface Plan {
  codingPlanTitle: string
  tasks: Task[]
  "project-memorys": {
    [key: string]: ProjectMemory
  }
}

interface Task {
  id: number
  title: string
  description: string
  details: string
  testStrategy: string
  subtasks: Subtask[]
}

interface Subtask {
  id: number
  title: string
  description: string
  details: string
  testStrategy: string
}

interface ProjectMemory {
  title: string
  points: string[]
}

interface PlanDisplayProps {
  plan: Plan
}

// 子任务组件
const SubtaskDisplay: React.FC<{ subtask: Subtask }> = ({ subtask }) => (
  <div className="ml-4 pl-4 border-l border-dashed border-gray-300">
    <h4 className="font-semibold text-sm text-gray-800 flex items-center">
      <ListTodo className="h-4 w-4 mr-2 text-gray-500" />
      {subtask.title}
    </h4>
    <p className="text-xs text-gray-600 mt-1">{subtask.description}</p>
    <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
      <strong>具体细节:</strong> {subtask.details}
    </p>
    <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
      <strong>测试策略:</strong> {subtask.testStrategy}
    </p>
  </div>
)

// 任务组件
const TaskDisplay: React.FC<{ task: Task }> = ({ task }) => (
  <Accordion type="single" collapsible className="w-full" defaultValue={`task-${task.id}`}>
    <AccordionItem value={`task-${task.id}`} className="border-b-0">
      <AccordionTrigger className="text-base font-semibold hover:no-underline [&[data-state=open]]:bg-gray-50 px-4 rounded-t-lg">
        <div className="flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-3 text-blue-500" />
          <span>{task.title}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 bg-white border border-t-0 rounded-b-lg">
        <p className="text-sm text-gray-700 mb-4">{task.description}</p>
        <Card className="mb-4">
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Flag className="h-4 w-4 mr-2" />
              具体内容
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 text-sm text-gray-600">
            {task.details}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <TestTube2 className="h-4 w-4 mr-2" />
              测试策略
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 text-sm text-gray-600">
            {task.testStrategy}
          </CardContent>
        </Card>
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-800">子任务</h3>
            <div className="space-y-4">
              {task.subtasks.map((subtask) => (
                <SubtaskDisplay key={subtask.id} subtask={subtask} />
              ))}
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  </Accordion>
)

// 项目记忆组件
const ProjectMemoryDisplay: React.FC<{ memory: ProjectMemory }> = ({ memory }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base flex items-center">
        <BrainCircuit className="h-5 w-5 mr-2 text-purple-500" />
        {memory?.title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
        {memory?.points?.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    </CardContent>
  </Card>
)

// 主组件
export default function PlanDisplay({ plan }: PlanDisplayProps) {
  if (!plan) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>正在等待计划数据...</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50/50">
      <div className="space-y-6">
        {plan.tasks && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">任务分解</CardTitle>
              <CardDescription>以下是完成项目所需的主要任务和子任务。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {plan.tasks.map((task) => (
                <TaskDisplay key={task.id} task={task} />
              ))}
            </CardContent>
          </Card>
        )}

        {plan["project-memorys"] && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">项目记忆</CardTitle>
              <CardDescription>在整个项目开发过程中需要遵循的最佳实践和原则。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {Object.values(plan["project-memorys"]).map((memory, index) => (
                <ProjectMemoryDisplay key={index} memory={memory} />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 
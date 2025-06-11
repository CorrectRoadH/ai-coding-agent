"use client"

import { useState, useCallback } from "react"
import type { ChatMessage, AgentType, DetailContent, MessageAction } from "@/types/agent"
import { toast } from "sonner"
import { useAgents } from "./useAgents" // 导入 useAgents hook

// 生成简短响应内容的辅助函数
function generateResponse(agent: AgentType | null, message: string): string {
  if (!agent) return ""

  switch (agent) {
    case "requirements":
      return "我已经分析了您的需求，点击查看详细的需求分析文档。"
    case "planning":
      return "我已经为您的项目制定了计划，点击查看详细的项目计划。"
    case "coding":
      return "我已经生成了代码实现，点击查看详细的代码和说明。"
    default:
      return "我收到了您的消息，但我不确定如何处理它。"
  }
}

// 生成详细内容的辅助函数
function generateDetailContent(agent: AgentType): string {
  switch (agent) {
    case "requirements":
      return `# 需求分析文档

## 功能需求
1. 用户认证与授权
   - 用户注册和登录
   - 权限管理
   - 密码重置

2. 核心功能
   - 功能A的详细描述
   - 功能B的详细描述
   - 功能C的详细描述

3. 用户界面要求
   - 响应式设计
   - 无障碍设计考虑
   - 支持的浏览器和设备

## 非功能需求
1. 性能要求
   - 响应时间
   - 并发用户数
   - 吞吐量

2. 安全要求
   - 数据加密
   - 防止SQL注入
   - CSRF保护

3. 可靠性要求
   - 系统可用性
   - 备份和恢复策略`

    case "planning":
      return `{
  "codingPlanTitle": "PDF 转 Markdown 工具",
  "tasks": [
    {
      "id": 1,
      "title": "项目仓库初始化",
      "description": "初始化 Git 仓库进行版本控制，并设置项目基础结构，包括依赖管理和基本文档。",
      "details": "为项目创建新目录并初始化为 Git 仓库。使用 Python 3.8+ 设置虚拟环境，并安装所需库：pdf2image、Pillow、google-cloud-vision 和 markdown。构建包含模块、测试和文档的项目文件夹结构，并创建初始的 README 和 .gitignore 文件。",
      "testStrategy": "验证仓库是否正确初始化，.gitignore 和 README.md 是否存在，虚拟环境已安装所需库，并且 requirements.txt 已生成。",
      "priority": "high",
      "dependencies": [],
      "status": "pending",
      "subtasks": [
        {
          "id": 1,
          "title": "创建项目目录",
          "description": "创建项目的新目录。",
          "details": "使用命令行创建名为 'project_repo' 的新目录。",
          "status": "in-progress",
          "testStrategy": "验证目录是否存在。",
          "dependencies": [],
          "priority": "high"
        },
        {
          "id": 2,
          "title": "初始化 Git 仓库并创建 .gitignore",
          "description": "将创建的目录初始化为 Git 仓库，并添加 .gitignore 文件。",
          "dependencies": [1],
          "details": "在 'project_repo' 目录中运行 'git init'。创建 \`.gitignore\` 文件，忽略如 \`venv/\`, \`__pycache__/\`, \`*.pyc\`, \`.env\` 文件, IDE配置文件（如 \`.idea/\`, \`.vscode/\`）。",
          "status": "pending",
          "testStrategy": "检查 .git 目录是否已创建，\`.gitignore\` 文件是否存在并包含基本忽略规则。",
          "priority": "high"
        },
        {
          "id": 3,
          "title": "设置虚拟环境",
          "description": "使用 Python 3.8+ 创建虚拟环境。",
          "dependencies": [2],
          "details": "使用 'python3 -m venv venv' 创建名为 'venv' 的虚拟环境。",
          "status": "pending",
          "testStrategy": "确保 'venv' 目录已创建。",
          "priority": "high"
        },
        {
          "id": 4,
          "title": "安装所需库并生成 requirements.txt",
          "description": "安装项目所需的库，并生成依赖文件。",
          "dependencies": [3],
          "details": "激活虚拟环境并运行 'pip install pdf2image Pillow google-cloud-vision markdown'。运行 'pip freeze > requirements.txt' 生成依赖文件。",
          "status": "pending",
          "testStrategy": "检查库是否在 'pip freeze' 中列出，并且 \`requirements.txt\` 文件已生成且内容正确。",
          "priority": "high"
        },
        {
          "id": 5,
          "title": "构建项目文件夹结构和初始 README",
          "description": "创建模块、测试、文档等文件夹，并添加基础 README.md。",
          "dependencies": [4],
          "details": "在 'project_repo' 中创建 'src/' (或 'modules/'), 'tests/', 'docs/', 'examples/' (存放示例PDF和预期输出), 'config/' (若需) 目录。在项目根目录创建基础的 \`README.md\` 文件，包含项目简介、安装和使用说明初步框架。",
          "status": "pending",
          "testStrategy": "验证所有指定的核心目录以及 \`README.md\` 是否已创建。",
          "priority": "high"
        }
      ]
    },
    {
      "id": 2,
      "title": "实现 PDF 处理模块",
      "description": "开发用于将 PDF 文档转换为高质量图像的模块，并处理潜在错误。",
      "details": "使用 pdf2image 库将 PDF 页面转换为高质量图像 (例如，指定 300 DPI，PNG 格式)。实现处理单页和多页 PDF 的功能。确保图像以规范命名规则保存在临时工作目录或指定输出子目录。增加对加密PDF和常见损坏PDF的错误处理。",
      "testStrategy": "使用各种 PDF 文件（单页、多页、不同分辨率、图文混排、轻微损坏、加密）测试模块。验证图像生成、命名、质量，以及错误处理（文件不存在、无法打开、密码错误）是否按预期工作。",
      "priority": "high",
      "dependencies": [1],
      "status": "pending",
      "subtasks": [
        {
          "id": 1,
          "title": "实现核心 PDF 到图像转换逻辑",
          "description": "使用 pdf2image 将 PDF 页面转换为图像列表。",
          "details": "关注基本的转换功能，能够处理单个 PDF 文件，输出图像列表。明确图像质量参数（DPI, 格式）。",
          "dependencies": [],
          "status": "pending",
          "testStrategy": "验证单页和多页 PDF 能否成功转换为图像列表，图像质量符合预期。",
          "priority": "high"
        },
        {
          "id": 2,
          "title": "设计并实现图像文件命名与存储策略",
          "description": "为转换后的图像设计命名规则并实现存储到指定位置的逻辑。",
          "details": "命名规则应包含原文件名和页码 (例如, \`original_pdf_filename_page_001.png\`)。图像应保存在临时目录或用户指定的输出子目录。",
          "dependencies": [1],
          "status": "pending",
          "testStrategy": "验证图像文件名是否符合规范，是否正确存储到目标路径。",
          "priority": "high"
        },
        {
          "id": 3,
          "title": "实现 PDF 解析的错误处理和日志记录",
          "description": "为 PDF 处理过程添加健壮的错误处理和日志记录。",
          "details": "处理如文件不存在、文件损坏、加密PDF（若支持密码输入则处理，否则报错）等情况。记录详细错误信息。",
          "dependencies": [2],
          "status": "pending",
          "testStrategy": "模拟各种错误场景，验证程序能否捕获错误、记录日志并给出适当反馈或继续处理（如适用）。",
          "priority": "high"
        },
        {
          "id": 4,
          "title": "(可选) 实现图像预处理",
          "description": "对转换后的图像进行预处理，以优化后续 OCR 效果。",
          "details": "例如使用 Pillow进行灰度化、对比度增强、去噪等操作。",
          "dependencies": [3],
          "status": "pending",
          "testStrategy": "对比预处理前后图像质量，评估对 OCR 准确率的潜在提升。",
          "priority": "medium"
        }
      ]
    },
    {
      "id": 3,
      "title": "集成 Gemini 2.5 Flash API",
      "description": "集成 Gemini 2.5 Flash API 用于图像的 OCR 处理，并确保API密钥安全和错误处理。",
      "details": "使用 google-cloud-vision 库设置 API 客户端。实现 API 密钥的安全管理和加载机制（如通过环境变量）。实现图像发送和文本接收功能，注意 API 对图像大小、格式、并发数等的限制。正确处理 API 响应状态码和错误（认证失败、配额超限、网络问题等）。",
      "testStrategy": "使用示例图像（清晰、模糊、不同方向）测试集成。验证 API 调用成功，返回文本符合预期。重点测试 API 错误处理：模拟无效密钥、超额调用等场景。",
      "priority": "high",
      "dependencies": [2],
      "status": "pending",
      "subtasks": [
        {
          "id": 1,
          "title": "实现安全的 API 密钥加载与管理",
          "description": "确保 API 密钥不被硬编码，能够安全地从外部配置（如环境变量）加载。",
          "details": "使用如 \`python-dotenv\` 库从 \`.env\` 文件加载，或通过其他配置管理方式。",
          "dependencies": [],
          "status": "pending",
          "testStrategy": "验证密钥能正确加载，且不在代码库中暴露。",
          "priority": "high"
        },
        {
          "id": 2,
          "title": "封装 API 调用函数",
          "description": "创建独立的函数或类方法来处理图像准备、请求发送和基础响应解析。",
          "details": "封装调用 Gemini API 的逻辑，使其易于在项目中复用。",
          "dependencies": [1],
          "status": "pending",
          "testStrategy": "验证封装的函数能正确调用 API 并返回预期格式的响应。",
          "priority": "high"
        },
        {
          "id": 3,
          "title": "实现详细的 API 错误分类、处理及重试机制",
          "description": "对 API 可能返回的各种错误进行分类处理，并实现合理的重试逻辑。",
          "details": "处理如认证失败、配额超限、请求超时、服务不可用等错误。对可重试的错误（如瞬时网络问题、部分服务错误）实现指数退避重试。",
          "dependencies": [2],
          "status": "pending",
          "testStrategy": "模拟各种 API 错误，验证错误处理和重试机制是否按预期工作，日志是否清晰。",
          "priority": "high"
        }
      ]
    },
    {
      "id": 4,
      "title": "实现 OCR 功能",
      "description": "开发使用 OCR 处理图像并提取文本的核心功能，支持多语言和结构化输出。",
      "details": "创建一个核心函数或类，接收图像输入，调用 Task 3 的 API 服务进行 OCR。实现多语言支持（用户指定或 API 自动检测）。确保输出的原始文本是结构化的（如按页组织，保留文本块位置信息）。考虑对 OCR 结果进行初步后处理。",
      "testStrategy": "使用不同语言、字体、排版的图像测试。验证提取文本的准确性、完整性。测试多语言支持的有效性。验证输出结构的正确性。",
      "priority": "high",
      "dependencies": [3],
      "status": "pending",
      "subtasks": [
        {
          "id": 1,
          "title": "设计 OCR 结果的数据结构",
          "description": "定义用于存储 OCR 结果的清晰数据结构。",
          "details": "应包含页码、文本内容、可能的置信度、边界框信息等，方便后续处理。",
          "dependencies": [],
          "status": "pending",
          "testStrategy": "验证数据结构是否能有效承载 OCR 返回的各类信息。",
          "priority": "high"
        },
        {
          "id": 2,
          "title": "实现调用 API 并整合多页结果的逻辑",
          "description": "处理单个或多个图像（来自多页 PDF），调用 API 并将结果整合到设计好的数据结构中。",
          "details": "确保按页面顺序组织文本结果。",
          "dependencies": [1],
          "status": "pending",
          "testStrategy": "使用多页 PDF 转换的图像测试，验证所有页面的文本是否被提取并正确整合。",
          "priority": "high"
        },
        {
          "id": 3,
          "title": "(可选) 实现基本的 OCR 文本后处理和清洗",
          "description": "对提取的文本进行初步清洗，提高文本质量。",
          "details": "例如去除多余的连续空行、修正已知的常见 OCR 识别错误（如基于规则）。",
          "dependencies": [2],
          "status": "pending",
          "testStrategy": "对比后处理前后文本，评估清洗效果。",
          "priority": "medium"
        }
      ]
    },
    {
      "id": 5,
      "title": "开发 Markdown 转换模块",
      "description": "创建将识别的结构化文本转换为格式化 Markdown 的模块。",
      "details": "实现将提取文本转换为 Markdown 格式，保持基本文档结构（段落、换行）。尝试识别和转换标题、列表（可能基于启发式规则或 API 返回的语义信息）。明确图片和表格的处理策略（如占位符或简化转换）。处理 Markdown 特殊字符转义。",
      "testStrategy": "使用各种文本结构测试转换。验证输出的 Markdown 格式是否正确，能否被渲染器正确显示。测试特殊字符处理。",
      "priority": "medium",
      "dependencies": [4],
      "status": "pending",
      "subtasks": [
        {
          "id": 1,
          "title": "实现基本文本到 Markdown 段落的转换",
          "description": "将纯文本块转换为 Markdown 的段落和换行。",
          "details": "这是 Markdown 转换的基础。",
          "dependencies": [],
          "status": "pending",
          "testStrategy": "验证简单文本是否能正确转换为 Markdown 段落。",
          "priority": "medium"
        },
        {
          "id": 2,
          "title": "实现标题和列表的识别与转换",
          "description": "基于启发式规则或 API 元数据（若有）识别文本中的标题和列表，并转换为 Markdown 格式。",
          "details": "例如，根据行首字符、文本长度、空行等模式判断。",
          "dependencies": [1],
          "status": "pending",
          "testStrategy": "使用包含潜在标题和列表的文本测试，验证转换的准确性。",
          "priority": "medium"
        },
        {
          "id": 3,
          "title": "明确并实现图片和表格的处理策略",
          "description": "确定如何处理 OCR 文本中可能代表图片或表格的内容，并实现转换逻辑。",
          "details": "图片可能仅作文本占位符 \`[Image Placeholder]\`。表格可能转换为简单的文本布局或尝试生成 Markdown 表格语法（若文本有明显分隔符）。",
          "dependencies": [2],
          "status": "pending",
          "testStrategy": "验证图片和表格（或其占位符）是否按预期策略在 Markdown 中表示。",
          "priority": "low"
        },
        {
          "id": 4,
          "title": "实现 Markdown 特殊字符的转义",
          "description": "确保文本中的 Markdown 特殊字符（如 *, _, #）被正确转义，以避免意外的格式化。",
          "details": "例如，将 \`*\` 转换为 \`\\*\`。",
          "dependencies": [1],
          "status": "pending",
          "testStrategy": "使用包含特殊字符的文本测试，验证输出是否按预期转义。",
          "priority": "medium"
        }
      ]
    },
    {
      "id": 6,
      "title": "实现批量处理功能",
      "description": "添加对多个 PDF 文件的批量处理支持，包括并发处理和进度报告。",
      "details": "开发接受 PDF 文件路径列表或目录作为输入的功能。按顺序或并发处理每个文件（PDF转图像 -> OCR -> Markdown转换）。实现清晰的进度跟踪和每个文件的错误处理及汇总报告。",
      "testStrategy": "使用包含多个 PDF（有效、大型、无效）的目录测试。验证文件处理状态、并发稳定性（若实现）、效率及错误汇总报告的准确性。",
      "priority": "medium",
      "dependencies": [5],
      "status": "pending",
      "subtasks": [
        {
          "id": 1,
          "title": "实现文件/目录输入解析和文件列表生成",
          "description": "允许用户指定单个文件、多个文件或整个目录作为输入。",
          "details": "递归查找目录中的 PDF 文件。",
          "dependencies": [],
          "status": "pending",
          "testStrategy": "验证不同输入方式下是否能正确生成待处理的 PDF 文件列表。",
          "priority": "medium"
        },
        {
          "id": 2,
          "title": "实现顺序批量处理的主流程",
          "description": "按顺序迭代文件列表，对每个文件执行完整的转换流程。",
          "details": "集成之前开发的所有模块（PDF处理、OCR、Markdown转换）。",
          "dependencies": [1],
          "status": "pending",
          "testStrategy": "验证多个文件能否被顺序成功处理，输出结果正确。",
          "priority": "medium"
        },
        {
          "id": 3,
          "title": "(可选但推荐) 研究并实现并发处理",
          "description": "使用线程池或进程池实现并发处理，提高效率。",
          "details": "例如使用 Python 的 \`concurrent.futures\` 模块。注意 API 调用频率限制和本地计算资源管理。",
          "dependencies": [2],
          "status": "pending",
          "testStrategy": "对比并发与顺序处理的效率，测试其稳定性，确保不超出 API 限制或耗尽资源。",
          "priority": "medium"
        },
        {
          "id": 4,
          "title": "实现详细的进度报告和错误汇总机制",
          "description": "向用户显示处理进度，并在完成后提供成功/失败文件的汇总信息。",
          "details": "可以使用 \`tqdm\` 库显示进度条。错误汇总应包含失败原因。",
          "dependencies": [2],
          "status": "pending",
          "testStrategy": "验证进度报告是否准确，错误汇总是否清晰完整。",
          "priority": "medium"
        }
      ]
    },
    {
      "id": 7,
      "title": "创建命令行界面",
      "description": "开发用于用户交互的命令行界面，方便操作 PDF 到 Markdown 的转换工具。",
      "details": "使用 \`argparse\` 库创建 CLI。允许用户指定输入文件/目录、输出目录。提供配置选项：如 OCR 语言、图像 DPI、强制覆盖、日志级别、日志文件路径、并发任务数（若实现）。提供帮助文档 (\`-h, --help\`) 和版本信息 (\`--version\`)。考虑加入处理进度条显示（如 \`tqdm\`）。",
      "testStrategy": "通过运行各种命令组合测试 CLI。确保参数解析正确，转换按预期执行。验证帮助和版本信息。测试无效参数或缺失参数时的错误提示。",
      "priority": "medium",
      "dependencies": [6],
      "status": "pending",
      "subtasks": []
    },
    {
      "id": 8,
      "title": "实现日志和错误处理",
      "description": "在应用程序中添加健壮的日志记录和统一的错误处理机制。",
      "details": "使用 Python \`logging\` 库。定义日志级别和格式。允许日志输出到控制台和/或文件。在关键路径集成结构化日志。确保适当捕获、记录错误信息及堆栈跟踪，并向用户提供有意义的反馈。",
      "testStrategy": "模拟各种错误，验证是否被正确捕获、记录，以及应用程序是否能优雅处理。检查不同日志级别下输出的详细程度。",
      "priority": "medium",
      "dependencies": [7],
      "status": "pending",
      "subtasks": []
    },
    {
      "id": 9,
      "title": "测试和优化",
      "description": "对整个系统进行全面测试和性能优化，引入代码质量工具。",
      "details": "执行单元测试 (\`pytest\`)、集成测试和性能测试。优化代码效率和资源使用。引入代码 linting (\`flake8\`) 和 formatting (\`black\`)，并配置 pre-commit hooks。",
      "testStrategy": "运行全面的测试套件。使用性能分析工具识别瓶颈。分析代码覆盖率 (\`pytest-cov\`)。对比优化前后的性能指标。",
      "priority": "high",
      "dependencies": [8],
      "status": "pending",
      "subtasks": [
        {
          "id": 1,
          "title": "编写各模块的单元测试",
          "description": "为核心模块（PDF处理、API客户端、OCR逻辑、Markdown转换）编写单元测试。",
          "details": "推荐使用 \`pytest\` 框架。关注函数和类的独立功能。",
          "dependencies": [],
          "status": "pending",
          "testStrategy": "确保单元测试覆盖关键逻辑路径和边界条件。",
          "priority": "high"
        },
        {
          "id": 2,
          "title": "编写端到端的集成测试",
          "description": "测试从 PDF 输入到 Markdown 输出的完整流程，包括 CLI 调用。",
          "details": "使用示例文件验证整个系统的行为。",
          "dependencies": [1],
          "status": "pending",
          "testStrategy": "验证集成测试是否能真实反映用户使用场景下的系统正确性。",
          "priority": "high"
        },
        {
          "id": 3,
          "title": "建立性能测试场景并执行基准测试",
          "description": "针对大文件处理、大量文件的批量处理进行性能分析。",
          "details": "使用性能分析工具（如 \`cProfile\`, \`snakeviz\`, \`py-spy\`）识别瓶颈。",
          "dependencies": [2],
          "status": "pending",
          "testStrategy": "记录基准性能数据，用于后续优化效果评估。",
          "priority": "medium"
        },
        {
          "id": 4,
          "title": "根据测试结果进行代码和流程优化",
          "description": "优化代码效率、并发处理、内存管理等。",
          "details": "针对性能瓶颈和资源消耗进行改进。",
          "dependencies": [3],
          "status": "pending",
          "testStrategy": "对比优化前后的性能指标，验证优化效果。",
          "priority": "medium"
        },
        {
          "id": 5,
          "title": "配置并集成代码 linting 和 formatting 工具",
          "description": "引入 \`flake8\` (linting) 和 \`black\` (formatter) 以保证代码质量和风格一致性。",
          "details": "配置 pre-commit hooks 自动化检查和格式化。",
          "dependencies": [1],
          "status": "pending",
          "testStrategy": "验证工具是否能按预期工作，代码风格是否统一。",
          "priority": "medium"
        }
      ]
    }
  ],
  "project-memorys": {
    "versionControl": {
      "title": "版本控制 (Version Control)",
      "points": [
        "使用有意义的提交信息 (如 Conventional Commits)。",
        "使用特性分支 (Feature branches) 进行开发，完成后合并回主分支。",
        "定期 Pull 和 Push，保持本地与远程同步。"
      ]
    },
    "configurationManagement": {
      "title": "配置管理 (Configuration Management)",
      "points": [
        "API 密钥、默认路径等配置项应外部化，不硬编码。",
        "考虑使用 \`.env\` 文件配合 \`python-dotenv\` 或专门的配置文件（JSON, YAML, INI）。"
      ]
    },
    "documentation": {
      "title": "文档 (Documentation)",
      "points": [
        "完善 \`README.md\`：项目简介、功能、安装步骤、CLI 使用示例、依赖、贡献指南。",
        "在 \`docs/\` 目录中提供更详细的用户文档和开发者文档（如项目架构、API参考）。",
        "编写清晰的代码注释和 Docstrings。"
      ]
    },
    "dependencyManagement": {
      "title": "依赖管理 (Dependency Management)",
      "points": [
        "使用 \`requirements.txt\`。对于更严谨的管理，可考虑 \`Poetry\` 或 \`PDM\`。"
      ]
    },
    "codeStyleAndQuality": {
      "title": "代码风格和质量 (Code Style and Quality)",
      "points": [
        "尽早引入并强制使用 \`flake8\` (linting) 和 \`black\` (formatter)。",
        "集成到 pre-commit hooks 中。"
      ]
    },
    "iterativeDevelopment": {
      "title": "逐步迭代 (Iterative Development)",
      "points": [
        "先实现最小可行产品 (MVP)，然后逐步添加高级功能、优化和改进。"
      ]
    },
    "security": {
      "title": "安全性 (Security)",
      "points": [
        "严格管理 API 密钥等敏感信息，绝不提交到版本库。",
        "在文档中明确告知用户如何安全配置。"
      ]
    }
  }
}`

    case "coding":
      return `# 代码实现`

    default:
      return ""
  }
}

export function useMessages(
  chatId: string | null,
  agent: AgentType | null, // 当前选中的 agent
  onUpdateChatMessages?: (chatId: string, messages: ChatMessage[]) => void,
  onNextStage?: (nextAgent: AgentType, initialMessage?: string) => void,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [detailContent, setDetailContent] = useState<DetailContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getAgentTitle, generateMessageActions } = useAgents() // 从 useAgents 导入

  // 获取消息
  const fetchMessages = useCallback(async (chatId: string) => {
    if (!chatId) return

    setLoading(true)
    setError(null)
    try {
      // 在这里可以替换为真实的API调用
      await new Promise((resolve) => setTimeout(resolve, 500))
      setMessages([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取消息失败")
    } finally {
      setLoading(false)
    }
  }, [])

  const _generateStreamingResponse = useCallback(
    async (userContent: string, targetChatId: string, targetAgent: AgentType, currentMessages: ChatMessage[]) => {
      setLoading(true)
      setError(null)

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: userContent,
        role: "user",
        timestamp: new Date(),
      }

      const messagesWithUser = [...currentMessages, userMessage]
      setMessages(messagesWithUser)
      if (onUpdateChatMessages) {
        onUpdateChatMessages(targetChatId, messagesWithUser)
      }

      const assistantMessageId = (Date.now() + 1).toString()
      const placeholderAiResponse: ChatMessage = {
        id: assistantMessageId,
        content: "思考中...",
        role: "assistant",
        timestamp: new Date(),
        actions: [],
        detailContent: "",
      }

      setMessages((prevMessages) => [...prevMessages, placeholderAiResponse])

      const detail: DetailContent = {
        id: assistantMessageId,
        title: `${getAgentTitle(targetAgent)} 详情`,
        content: "",
      }
      setDetailContent(detail)

      let streamInterval: NodeJS.Timeout | undefined

      try {
        const fullDetailContent = generateDetailContent(targetAgent)
        const chunks = fullDetailContent.split(/(\s+)/)
        let streamedContent = ""

        streamInterval = setInterval(() => {
          if (chunks.length > 0) {
            const chunk = chunks.shift()!
            streamedContent += chunk
            setDetailContent({ ...detail, content: streamedContent })
          } else {
            clearInterval(streamInterval)

            const finalAiResponse: ChatMessage = {
              ...placeholderAiResponse,
              content: generateResponse(targetAgent, userContent),
              detailContent: fullDetailContent,
              actions: generateMessageActions(targetAgent),
            }

            setMessages((prevMessages) => {
              const updatedMessages = prevMessages.map((msg) => (msg.id === assistantMessageId ? finalAiResponse : msg))
              if (onUpdateChatMessages) {
                onUpdateChatMessages(targetChatId, updatedMessages)
              }
              return updatedMessages
            })
            setLoading(false)
          }
        }, 50)
      } catch (err) {
        if (streamInterval) clearInterval(streamInterval)
        const errorMessage = err instanceof Error ? err.message : "生成响应时出错"
        setError(errorMessage)
        const errorAiResponse: ChatMessage = {
          ...placeholderAiResponse,
          content: `错误: ${errorMessage}`,
        }
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg.id === assistantMessageId ? errorAiResponse : msg)),
        )
        setLoading(false)
      }
    },
    [getAgentTitle, generateMessageActions, onUpdateChatMessages],
  )

  // 发送消息
  const sendMessage = useCallback(
    async (content: string) => {
      if (!agent || !chatId) return null

      await _generateStreamingResponse(content, chatId, agent, messages)
      return null
    },
    [agent, chatId, messages, _generateStreamingResponse],
  )

  // 发送消息（支持直接传入chatId和指定agent类型）
  const sendMessageWithChatId = useCallback(
    async (content: string, targetChatId: string, targetAgent?: AgentType) => {
      const effectiveAgent = targetAgent || agent
      if (!effectiveAgent) return null

      const currentMessages = targetChatId === chatId ? messages : []
      await _generateStreamingResponse(content, targetChatId, effectiveAgent, currentMessages)
      return null
    },
    [agent, messages, chatId, _generateStreamingResponse],
  )

  // 处理消息操作
  const handleMessageAction = useCallback(
    (messageId: string, action: MessageAction) => {
      const message = messages.find((m) => m.id === messageId)
      if (!message) return

      switch (action.type) {
        case "detail":
          // 显示详细内容在右侧面板
          if (message.role === "assistant" && message.detailContent && agent) {
            const detail: DetailContent = {
              id: messageId,
              title: `${getAgentTitle(agent)} 详情`,
              content: message.detailContent, // 使用消息中存储的详细内容
            }
            setDetailContent(detail)
          }
          break

        case "copy":
          // 复制详细内容
          if (message.role === "assistant" && message.detailContent) {
            navigator.clipboard.writeText(message.detailContent).then(() => {
              toast.success("复制成功", {
                description: `内容已复制到剪贴板`,
              })
            })
          }
          break

        case "next-stage":
          // 进入下一阶段，传递详细内容
          if (onNextStage && agent && message.detailContent) {
            let nextAgent: AgentType
            if (agent === "requirements") {
              nextAgent = "planning"
            } else if (agent === "planning") {
              nextAgent = "coding"
            } else {
              return
            }
            // 使用消息中存储的详细内容作为下一阶段的初始消息
            console.log("Calling onNextStage with:", nextAgent, message.detailContent.substring(0, 50) + "...")
            onNextStage(nextAgent, message.detailContent)
          }
          break

        case "export":
          if (agent === "coding" && message.role === "assistant" && message.detailContent) {
            const blob = new Blob([message.detailContent], { type: "text/markdown" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "project-code.md"
            a.click()
            URL.revokeObjectURL(url)
          }
          break

        default:
          break
      }
    },
    [messages, agent, onNextStage, getAgentTitle, toast],
  )

  // 查看详细内容
  const viewDetail = useCallback(
    (messageId: string) => {
      const message = messages.find((m) => m.id === messageId)
      if (message && message.role === "assistant" && message.detailContent && agent) {
        const detail: DetailContent = {
          id: messageId,
          title: `${getAgentTitle(agent)} 详情`,
          content: message.detailContent, // 使用消息中存储的详细内容
        }
        setDetailContent(detail)
        return detail
      }
      return null
    },
    [messages, agent, getAgentTitle],
  )

  // 清除消息
  const clearMessages = useCallback(() => {
    setMessages([])
    setDetailContent(null)
  }, [])

  // 设置消息 - 修复历史对话操作按钮问题
  const setMessagesData = useCallback(
    (newMessages: ChatMessage[], agentTypeForHistoricalMessages?: AgentType) => {
      // 确定用于生成操作按钮的 agent 类型
      const agentForActions = agentTypeForHistoricalMessages || agent

      if (agentForActions) {
        const processedMessages = newMessages.map((msg) => {
          if (msg.role === "assistant" && (!msg.actions || msg.actions.length === 0)) {
            return {
              ...msg,
              actions: generateMessageActions(agentForActions),
            }
          }
          return msg
        })
        setMessages(processedMessages)
      } else {
        setMessages(newMessages)
      }
    },
    [agent, generateMessageActions], // 依赖于当前的 agent 和 generateMessageActions
  )

  return {
    messages,
    detailContent,
    loading,
    error,
    fetchMessages,
    sendMessage,
    sendMessageWithChatId,
    handleMessageAction,
    viewDetail,
    clearMessages,
    setMessagesData,
  }
}

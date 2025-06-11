import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster" // 导入 Toaster

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Coding Agent",
  description: "An AI-powered coding assistant with requirements analysis, planning, and code generation",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {children}
        <Toaster /> 
      </body>
    </html>
  )
}

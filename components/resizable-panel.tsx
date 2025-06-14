"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface ResizablePanelProps {
  children: React.ReactNode
  defaultWidth: number
  minWidth: number
  maxWidth: number
  side: "left" | "right"
}

export default function ResizablePanel({ children, defaultWidth, minWidth, maxWidth, side }: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isDragging, setIsDragging] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      let newWidth
      if (side === "left") {
        newWidth = e.clientX
      } else {
        newWidth = window.innerWidth - e.clientX
      }

      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isDragging, minWidth, maxWidth, side])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  return (
    <div ref={panelRef} className="flex h-full relative" style={{ width: `${width}px` }}>
      <div
        className={`absolute top-0 ${
          side === "left" ? "right-0" : "left-0"
        } h-full w-1 cursor-col-resize hover:bg-blue-300 hover:bg-opacity-50 transition-colors z-10`}
        onMouseDown={handleMouseDown}
      />
      <div className="w-full">{children}</div>
    </div>
  )
}

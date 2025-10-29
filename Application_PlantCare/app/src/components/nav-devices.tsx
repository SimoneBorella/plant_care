"use client"

import { useState, useEffect, useRef } from "react"
import { IconCpu } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavDevices() {
  const { isMobile } = useSidebar()

  const [devices, setDevices] = useState<{ device_id: string; online: boolean }[]>([])

  const wsRef = useRef<WebSocket | null>(null)



  const fetchDevices = async () => {
    try {
      const res = await fetch("/api/devices")
      if (!res.ok) throw new Error("Failed to fetch devices")
      const data = await res.json()
      setDevices(
        data.map((d: any) => ({
          device_id: d.device_id,
          online: d.online ?? false,
        }))
      )
    } catch (err) {
      console.error(err)
    }
  }

  // Handle incoming WebSocket messages
  const handleWSMessage = (event: MessageEvent) => {
    try {
      const msg = JSON.parse(event.data)

      const newDevices = Array.isArray(msg) ? msg : [msg]

      setDevices((prev) => {
        const updated = [...prev] // copy previous state

        newDevices.forEach((device) => {
          if (!device.device_id) return // skip invalid entries

          const index = updated.findIndex((d) => d.device_id === device.device_id)
          if (index !== -1) {
            updated[index] = { ...updated[index], online: device.online }
          } else {
            updated.push({ device_id: device.device_id, online: device.online })
          }
        })

        return updated
      })
    } catch (err) {
      console.error("Invalid WS message:", event.data)
    }
  }


  useEffect(() => {
    fetchDevices()

    // Connect to WebSocket backend
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      `ws://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:3001`

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => console.log("Connected to WebSocket server")
    ws.onmessage = handleWSMessage
    ws.onclose = () => console.log("WebSocket connection closed")
    ws.onerror = (err) => console.error("WebSocket error:", err)

    return () => {
      ws.close()
    }
  }, [])

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Devices</SidebarGroupLabel>

      <SidebarMenu>
        {devices.map((device, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuButton asChild>
              <a
                href={`/devices/${encodeURIComponent(device.device_id)}`}
                className="flex items-center gap-2"
              >
                <IconCpu />
                <span>{device.device_id}</span>
                <SidebarMenuAction>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      device.online ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                </SidebarMenuAction>
              </a>
            </SidebarMenuButton>

          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

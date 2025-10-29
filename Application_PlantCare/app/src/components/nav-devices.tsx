"use client"

import { useState, useEffect } from "react"
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

  const [devices, setDevices] = useState<{ name: string; online: boolean }[]>([])

  const fetchDevices = async () => {
    try {
      const res = await fetch("/api/devices")
      if (!res.ok) throw new Error("Failed to fetch devices")
      const data = await res.json()
      setDevices(
        data.map((d: any) => ({
          name: d.device_id,
          online: d.online ?? false,
        }))
      )
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchDevices()

    const interval = setInterval(fetchDevices, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Devices</SidebarGroupLabel>

      <SidebarMenu>
        {devices.map((device) => (
          <SidebarMenuItem key={device.name}>
            <SidebarMenuButton asChild>
              <a
                href={`/devices/${encodeURIComponent(device.name)}`}
                className="flex items-center gap-2"
              >
                <IconCpu />
                <span>{device.name}</span>
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

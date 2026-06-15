"use client"

import { useState, useEffect } from "react"
import { IconBattery2, IconCpu } from "@tabler/icons-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type SectionCardsDeviceProps = {
  deviceId: string
}

type DeviceInfo = {
  device_id: string
  online: boolean
  battery?: number
  slots?: { id: string; assigned: boolean }[]
}

export function SectionCardsDevice({ deviceId }: SectionCardsDeviceProps) {
  const [device, setDevice] = useState<DeviceInfo | null>(null)

  useEffect(() => {
    const mockData: DeviceInfo = {
      device_id: deviceId,
      online: true,
      battery: 76,
      slots: [
        { id: "1", assigned: true },
        { id: "2", assigned: false },
        { id: "3", assigned: true },
        { id: "4", assigned: false },
      ],
    }

    setDevice(mockData)
  }, [deviceId])

  if (!device) {
    return (
      <div className="text-muted-foreground text-center p-6">
        Loading device info...
      </div>
    )
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
      {/* --- DEVICE OVERVIEW CARD --- */}
      <Card className="p-6 @container/card" data-slot="card">
        <CardHeader className="flex flex-col gap-2">
          <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
            <IconCpu className="text-muted-foreground" />
            <span>{device.device_id}</span>
            <span
              className={`w-3 h-3 rounded-full ${
                device.online ? "bg-green-500" : "bg-red-500"
              }`}
              title={device.online ? "Online" : "Offline"}
            ></span>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 mt-4">
          {/* Battery indicator */}
          <div className="flex items-center gap-3">
            <IconBattery2 className="text-muted-foreground" />
            <span className="font-medium">
              Battery: {device.battery ?? "N/A"}%
            </span>
          </div>

          {/* Slots list */}
          <div>
            <h3 className="text-sm text-muted-foreground mb-2 font-medium">
              Slots
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {device.slots?.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between rounded-lg border p-2"
                >
                  <span className="font-medium">Slot {slot.id}</span>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      slot.assigned ? "bg-green-500" : "bg-red-500"
                    }`}
                    title={slot.assigned ? "Assigned" : "Unassigned"}
                  ></span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- SEPARATOR --- */}
      <Separator className="my-4 col-span-full" />

      {/* --- SLOT CARDS (4-column grid) --- */}
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {device.slots?.map((slot) => (
          <Card key={slot.id} className="p-4 @container/card" data-slot="card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                Slot {slot.id}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

"use client"

import { useParams } from "next/navigation"
import { usePlants } from "@/components/providers/plants-provider"
import { SectionCardsDevice } from "@/components/section-cards-device"

export default function DevicePage() {
  const params = useParams()
  // const { plants } = usePlants()

  const deviceId = decodeURIComponent(params.deviceId as string)
  // const plant = plants.find((p) => p.name === plantName)

  return (
    <div className="@container/main flex flex-col gap-8 py-6 px-4 md:px-6">
      <SectionCardsDevice deviceId={deviceId}/>
    </div>
  )
}
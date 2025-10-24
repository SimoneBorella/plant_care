"use client"

import { useParams } from "next/navigation"
import { usePlants } from "@/components/providers/plants-provider"
import { SectionCardsPlant } from "@/components/section-cards-plant"

export default function PlantPage() {
  const params = useParams()
  const { plants } = usePlants()

  const plantName = decodeURIComponent(params.plantName as string)
  const plant = plants.find((p) => p.name === plantName)

  if (!plant) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-muted-foreground">
        Plant "{plantName}" not found.
      </div>
    )
  }


  return (
    <div className="@container/main flex flex-col gap-8 py-6 px-4 md:px-6">
      <SectionCardsPlant plantName={plantName}/>
    </div>
  )
}
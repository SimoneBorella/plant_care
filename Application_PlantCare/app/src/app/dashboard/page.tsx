"use client"

import { usePlants } from "@/components/providers/plants-provider"
import { SectionCardsPlantDashboard } from "@/components/section-cards-plant-dashboard"

export default function Home() {
  const { plants } = usePlants()

  if (!plants || plants.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-muted-foreground">
        No plants found.
      </div>
    )
  }

  return (
    <div className="@container/main flex flex-col gap-8 py-6 px-4 md:px-6">
      {plants.map((plant) => (
        <section
          key={plant.name}
          className="flex flex-col gap-4 p-6 rounded-lg border-2 border-primary/40 dark:border-primary/70 shadow-sm"
        >
          <SectionCardsPlantDashboard plantName={plant.name}/>
        </section>
      ))}
    </div>
  )
}
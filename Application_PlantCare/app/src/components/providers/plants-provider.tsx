"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Plant = {
  name: string
  type: string
  description: string
  createdAt: string
  updatedAt: string
}

type PlantContextType = {
  plants: Plant[]
  addPlant: (plant: Plant) => Promise<void>
  removePlant: (name: string) => Promise<void>
}

const PlantContext = createContext<PlantContextType | undefined>(undefined)

export function PlantProvider({ children }: { children: ReactNode }) {
  const [plants, setPlants] = useState<Plant[]>([])

  useEffect(() => {
    async function fetchPlants() {
      try {
        const res = await fetch("/api/plants")
        if (!res.ok) throw new Error("Failed to fetch plants")
        const data: Plant[] = await res.json()
        setPlants(data)
      } catch (err) {
        console.error("Failed to fetch plants:", err)
      }
    }

    fetchPlants()
  }, [])

  const addPlant = async (plant: Plant) => {
    try {
      const res = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plant),
      })

      if (!res.ok) throw new Error("Failed to add plant")
      setPlants((prev) => [...prev, plant])
    } catch (err) {
      console.error("Failed to add plant:", err)
    }
  }

  const removePlant = async (name: string) => {
    try {
      const res = await fetch(`/api/plants?name=${encodeURIComponent(name)}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete plant")
      setPlants((prev) => prev.filter((p) => p.name !== name))
    } catch (err) {
      console.error("Failed to delete plant:", err)
    }
  }

  return (
    <PlantContext.Provider value={{ plants, addPlant, removePlant }}>
      {children}
    </PlantContext.Provider>
  )
}

export const usePlants = () => {
  const context = useContext(PlantContext)
  if (!context) throw new Error("usePlants must be used inside a PlantProvider")
  return context
}

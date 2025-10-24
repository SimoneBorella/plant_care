import { usePlants } from "@/components/providers/plants-provider"

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartRadialTextCard
} from "@/components/chart-radial-text-card"





type SectionCardsPlantDashboardProps = {
  plantName: string
}

export function SectionCardsPlantDashboard({ plantName }: SectionCardsPlantDashboardProps) {
  const { plants } = usePlants()

  const plant = plants.find(p => p.name === plantName)

  if (!plant) {
    return (
      <div className="text-muted-foreground">No data available for {plantName}</div>
    )
  }


  const data = [
    {
      title: "Soil moisture",
      value: 75,
      min_value: 0,
      max_value: 100,
      unit: "%",
      label: "Soil moisture",
      color: "hsl(var(--primary))"
    },
    {
      title: "Temperature",
      value: 22.3,
      min_value: 0,
      max_value: 45,
      unit: "°C",
      label: "Temperature",
      color: "hsl(var(--chart-2))"
    },
  ]

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          {/* <CardDescription>{plant.name}</CardDescription> */}
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {plant.name}
          </CardTitle>
          {/* <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction> */}
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {plant.type}
          </div>
          <div className="text-muted-foreground">
            {plant.description}
          </div>
        </CardFooter>
      </Card>


      <Card className="@container/card">
        
      </Card>


      
      {data.map((item) => (
        <ChartRadialTextCard
          key={item.title}
          {...item}
        />
      ))}
    </div>
  )
}

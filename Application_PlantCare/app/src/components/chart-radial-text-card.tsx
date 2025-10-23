"use client"

import { TrendingUp } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"



type ChartRadialTextCardProps = {
  title: string
  description?: string
  value: number
  min_value : number
  max_value : number
  unit: string
  label: string
  color?: string
}




export function ChartRadialTextCard({
  title,
  description = "Last update: now",
  value,
  min_value,
  max_value,
  unit,
  label,
  color = "hsl(var(--primary))",
}: ChartRadialTextCardProps) {

  const startAngle = 225
  const endAngle = -45

  const clampedValue = Math.min(Math.max(value, min_value), max_value)
  const normalized = (clampedValue - min_value) / (max_value - min_value)

  const totalAngle = startAngle - endAngle
  const computedEndAngle = startAngle - totalAngle * normalized


  const chartData = [
    { name: label, value: value, min_value: min_value, max_value: max_value, fill: color },
  ]

  const chartConfig: ChartConfig = {
    value: { label },
  }


  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={startAngle}
            endAngle={computedEndAngle}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="value" background cornerRadius={10} className="fill-primary dark:fill-chart-0" />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {value}{unit}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {label}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>

      {/* <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {trend === "up" ? (
            <>
              Trending up by {trendValue} this month{" "}
              <TrendingUp className="h-4 w-4 text-green-500" />
            </>
          ) : (
            <>
              Trending down by {trendValue} this month{" "}
              <TrendingUp className="h-4 w-4 rotate-180 text-red-500" />
            </>
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total {label.toLowerCase()} for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  )
}

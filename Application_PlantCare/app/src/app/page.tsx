"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import Autoplay from "embla-carousel-autoplay"
import { Button } from "@/components/ui/button"

export default function Home() {

  const autoplay_plugin = React.useRef(
    Autoplay({ delay: 1000 })
  )

  const router = useRouter()

  const handleGoDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center py-10">

      <h1 className="text-5xl font-bold text-center h-40 flex items-center justify-center">
        Welcome to PlantCare 🌿
      </h1>

      <Button
          onClick={handleGoDashboard}
          className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
        >
          {/* <IconPlus /> */}
          <span>Go to dashboard</span>
      </Button>

      <Carousel
        plugins={[autoplay_plugin.current]}
        onMouseEnter={autoplay_plugin.current.stop}
        onMouseLeave={autoplay_plugin.current.reset}
        className="w-full max-w-md mt-20">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="text-4xl font-semibold">{index + 1}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

    </div>
  )
}

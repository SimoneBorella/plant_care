"use client"

import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
  IconPlus,
  IconPlant2,
  type Icon
} from "@tabler/icons-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { usePlants } from "@/components/providers/plants-provider"

export function NavPlants() {
  const { isMobile } = useSidebar()
  const { plants, addPlant, removePlant } = usePlants()

  const handleAddPlant = async () => {
    const now = new Date().toISOString()
    const newPlant = {
      name: `Plant ${plants.length + 1}`,
      type: "Unknown",
      description: "Newly added plant",
      createdAt: now,
      updatedAt: now,
    }
    await addPlant(newPlant)
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Plants</SidebarGroupLabel>

      <SidebarMenu>
        {plants.map((plant) => (
          <SidebarMenuItem key={plant.name}>
            <SidebarMenuButton asChild>
              <a href={`/plants/${encodeURIComponent(plant.name)}`}>
                <IconPlant2 />
                <span>{plant.name}</span>
              </a>
            </SidebarMenuButton>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  showOnHover
                  className="data-[state=open]:bg-accent rounded-sm"
                >
                  <IconDots />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-24 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem asChild>
                  <a href={`/plants/${encodeURIComponent(plant.name)}`}>
                    <IconFolder />
                    <span>Open</span>
                  </a>
                </DropdownMenuItem>

                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => removePlant(plant.name)}
                >
                  <IconTrash />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>






      <SidebarMenu>
        <SidebarMenuButton
          tooltip="Add new plant"
          onClick={handleAddPlant}
          className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
        >
          <IconPlus />
          <span>Add new plant</span>
        </SidebarMenuButton>
      </SidebarMenu>
    </SidebarGroup>
  )
}

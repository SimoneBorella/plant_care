"use client"

import * as React from "react"
import {
  IconPlant,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavPlants } from "@/components/nav-plants"
import { NavDevices } from "@/components/nav-devices"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <IconPlant className="!size-7" />
                <span className="text-2xl font-bold">PlantCare</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavDevices />
        <NavPlants />
        <NavSecondary className="mt-auto" />
      </SidebarContent>
      {/* <SidebarFooter>
      </SidebarFooter> */}
    </Sidebar>
  )
}

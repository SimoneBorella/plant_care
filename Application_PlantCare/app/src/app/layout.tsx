import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Inter, Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { ActiveThemeProvider } from "@/components/active-theme";
import { PlantProvider } from "@/components/providers/plants-provider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";

const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const robotoFont = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
});

const robotoMonoFont = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "PlantCare",
  description: "Plant care system application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get("active_theme")?.value;
  const isScaled = activeThemeValue?.endsWith("-scaled");

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          interFont.className,
          "bg-background overscroll-none font-sans antialiased",
          activeThemeValue ? `theme-${activeThemeValue}` : "",
          isScaled ? "theme-scaled" : ""
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <ActiveThemeProvider initialTheme={activeThemeValue}>
            <PlantProvider>
              <SidebarProvider
                style={
                  {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                  } as React.CSSProperties
                }
              >
                {/* Sidebar stays fixed */}
                <AppSidebar variant="inset" />

                {/* Main content area */}
                <SidebarInset>
                  {/* Header stays fixed */}
                  <SiteHeader />

                  {/* Scrollable main content */}
                  <main>
                    {children}
                  </main>
                </SidebarInset>
              </SidebarProvider>
            </PlantProvider>
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

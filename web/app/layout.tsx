import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { QueryProvider } from "@/src/presentation/providers/QueryProvider"
import { AuthCookieSync } from "@/src/presentation/providers/AuthCookieSync"
import { Navbar } from "@/src/presentation/components/layout/Navbar"
import { Footer } from "@/src/presentation/components/layout/Footer"
import { Toaster } from "@/components/ui/sonner"
import { NavigationProgress } from "@/src/presentation/components/common/NavigationProgress"

export const metadata: Metadata = {
  title: {
    default: "kikplate — template registry",
    template: "%s",
  },
  description: "Discover, share, and generate production-ready projects from reusable templates.",
  openGraph: {
    siteName: "kikplate",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <NavigationProgress />
            <AuthCookieSync />
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
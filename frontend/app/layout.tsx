import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { DataProvider } from "@/lib/data-store"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "ระบบจัดการคลังสินค้า",
  description: "Warehouse Management System",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <DataProvider>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </DataProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

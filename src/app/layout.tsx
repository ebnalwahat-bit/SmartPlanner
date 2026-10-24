import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Noto_Sans, Noto_Sans_Arabic } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "latin-ext", "cyrillic"],
})

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
})

export const metadata: Metadata = {
  title: "مفكرتي | My Notebook — Offline Notes in 7 Languages",
  description:
    "مفكرة ذكية تعمل دون إنترنت على الموبيل والحاسوب، وتدعم 7 لغات مع الوضع الداكن والتصنيفات والوسوم. A smart offline notebook for mobile and desktop in 7 languages.",
  applicationName: "مفكرتي",
  keywords: [
    "مفكرة",
    "ملاحظات",
    "بدون إنترنت",
    "notes",
    "notebook",
    "offline",
    "notlar",
    "заметки",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#059669" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

const setInitialLangDir = `(function(){try{var lang='ar';var raw=localStorage.getItem('mudhakira-store');if(raw){var d=JSON.parse(raw);if(d&&d.state&&d.state.language){lang=d.state.language}}if(['ar','en','fr','es','de','tr','ru'].indexOf(lang)===-1)lang='ar';document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';}catch(e){document.documentElement.lang='ar';document.documentElement.dir='rtl';}})()`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: setInitialLangDir }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSans.variable} ${notoArabic.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="bottom-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}

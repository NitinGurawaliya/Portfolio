import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your developer portfolio. Import GitHub projects, add skills, customize your profile, and publish your portfolio.",
  openGraph: {
    title: "Dashboard | DevFolio",
    description: "Manage your developer portfolio. Import GitHub projects, add skills, customize your profile, and publish your portfolio.",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to DevFolio with your GitHub account to create and manage your developer portfolio.",
  openGraph: {
    title: "Sign In | DevFolio",
    description: "Sign in to DevFolio with your GitHub account to create and manage your developer portfolio.",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Sidebar from "@/components/Sidebar"
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user)
    }
    getSession()
  }, [])
  if (!user) return null
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        height: "100vh",
      }}
    >
      {/* SIDEBAR */}
      <Sidebar user={user} />
      {/* CHAT */}
      <div>{children}</div>
    </div>
  )
}
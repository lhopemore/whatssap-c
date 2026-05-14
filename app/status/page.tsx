"use client"
import { useState } from "react"
import { useEffect } from "react"
import { supabase } from "../../lib/supabaseClient"
export default function StatusPage() {
const [statuses, setStatuses] =
  useState<any[]>([])
const [text, setText] =
  useState("")
const [user, setUser] =
  useState<any>(null)  
  useEffect(() => {
  const getUser = async () => {
    const {
      data: { session },
    } =
      await supabase.auth.getSession()
    setUser(session?.user)
  }
  getUser()
}, [])
const postStatus =
  async () => {
    if (!text || !user) return
    await supabase
      .from("status")
      .insert([
        {
          text,
          user_email:
            user.email,
        },
      ])
    setText("")
  }
  useEffect(() => {
  const fetchStatuses =
    async () => {
      const yesterday =
        new Date()
      yesterday.setHours(
        yesterday.getHours() - 24
      )
      const { data } =
        await supabase
          .from("status")
          .select("*")
          .gte(
            "created_at",
            yesterday.toISOString()
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          )
      setStatuses(data || [])
    }
  fetchStatuses()
}, [])
  return (
   <div
  style={{
    padding: "20px",
  }}
>
  <h1>Status</h1>
  <div
    style={{
      display: "flex",
      gap: "10px",
      marginBottom: "20px",
    }}
  >
    <input
      value={text}
      onChange={(e) =>
        setText(e.target.value)
      }
      placeholder="What's new?"
    />
    <button
      onClick={postStatus}
    >
      Post
    </button>
  </div>
  {statuses.map((status) => (
    <div
      key={status.id}
      style={{
        padding: "15px",
        borderBottom:
          "1px solid #ddd",
      }}
    >
      <strong>
        {status.user_email}
      </strong>
      <p>{status.text}</p>
      {status.image_url && (
        <img
          src={status.image_url}
          style={{
            width: "200px",
            borderRadius: "10px",
          }}
        />
      )}
    </div>
  ))}
</div>
  )  
}
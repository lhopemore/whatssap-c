"use client"
import { useState } from "react"
import { useEffect } from "react"
import { supabase } from "../../lib/supabaseClient"
export default function GroupPage() {
    const [name, setName] =
  useState("")

const [members, setMembers] =
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
const createGroup =
  async () => {
    if (
      !name ||
      !members ||
      !user
    )
      return

    const users = [
      user.email,
      ...members
        .split(",")
        .map((m) => m.trim()),
    ]

    await supabase
      .from("chats")
      .insert([
        {
          users: JSON.stringify(
            users
          ),
          is_group: true,
          group_name: name,
        },
      ])

    alert("Group created")
  }

  return (
    <div
  style={{
    padding: "20px",
  }}
>
  <h1>Create Group</h1>

  <input
    placeholder="Group name"
    value={name}
    onChange={(e) =>
      setName(e.target.value)
    }
  />
  <input
    placeholder="Members "
    value={members}
    onChange={(e) =>
      setMembers(e.target.value)
    }
  />

  <button
    onClick={createGroup}
  >
    Create
  </button>
</div>
  )
}
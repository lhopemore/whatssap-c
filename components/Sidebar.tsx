"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import ChatIcon from "@mui/icons-material/Chat"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import DonutLargeIcon from "@mui/icons-material/DonutLarge"
import GroupsIcon from "@mui/icons-material/Groups"
import {
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material"
export default function Sidebar({
  user,
}: {
  user: any
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [chats, setChats] = useState<any[]>([])
  const [sortedChats, setSortedChats] =
    useState<any[]>([])
const notificationSound =
  typeof window !== "undefined"
    ? new Audio(
        "/sounds/notification.mp3"
      )
    : null
  const [profiles, setProfiles] =
    useState<any[]>([])
const [isMobile, setIsMobile] =
  useState(false)
  const [lastMessages, setLastMessages] =
    useState<{ [key: string]: any }>({})

  const [unread, setUnread] = useState<{
    [key: string]: number
  }>({})
  const [search, setSearch] = useState("")
  // 🔥 MENU
  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }
  // 🔥 LOGOUT
  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }
  // 🔥 USER AVATAR
  const getAvatar = (userData: any) => {
  return (
    userData?.picture ||
    userData?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || "U")}&background=random`
  )
}
  // 🔥 OTHER USERS AVATAR
  const getAvatars = (email: string) => {
    if (!email) return `https://ui-avatars.com/api/?name=U&background=random`
  const profile = profiles.find((p) => p.email === email)
  return (
    profile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=random`
  )
  }
useEffect(() => {
  const checkMobile = () => {
    setIsMobile(
      window.innerWidth < 768
    )
  }

  checkMobile()
  window.addEventListener(
    "resize",
    checkMobile
  )
  return () => {
    window.removeEventListener(
      "resize",
      checkMobile
    )
  }
}, [])
  //  FETCH PROFILES
  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")

      setProfiles(data || [])
    }

    fetchProfiles()
  }, [])

  //  CREATE CHAT
  const createChat = async () => {
    const email = prompt("Enter email:")

    if (!email) return

    if (email === user.email) {
      alert("You cannot chat with yourself")
      return
    }
    const isValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    if (!isValid) {
      alert(
        "Please enter a valid email address."
      )
      return
    }

    //  vérifier compte réel
    const users = JSON.stringify(
      [user.email, email].sort()
    )

    //  vérifier doublon
    const { data: existingChats } =
      await supabase
        .from("chats")
        .select("*")
        .eq("users", users)
    if (
      existingChats &&
      existingChats.length > 0
    ) {
      router.push(
        `/chat/${existingChats[0].id}`
      )
      return
    }
    //  créer chat
    const { data } = await supabase
      .from("chats")
      .insert([{ users }])
      .select()

    if (data && data[0]) {
      router.push(`/chat/${data[0].id}`)
    }
  }

  //  FETCH CHATS
  useEffect(() => {
    const fetchChats = async () => {
      const { data, error } =
        await supabase
          .from("chats")
          .select("*")
          .ilike(
            "users",
            `%${user.email}%`
          )
      if (error) {
        console.error(
          "Error fetching chats:",
          error
        )
        return
      }
      setChats(data || [])
    }
    if (user?.email) {
      fetchChats()
    }
  }, [user.email])

  //  FETCH LAST MESSAGES
  useEffect(() => {
    const fetchLastMessages =
      async () => {
        if (chats.length === 0) return
        const chatIds = chats.map(
          (c) => c.id
        )
        const { data } = await supabase
          .from("messages")
          .select("*")
          .in("chat_id", chatIds)
          .order("created_at", {
            ascending: false,
          })
        const map: any = {}
        for (const msg of data || []) {
          if (!map[msg.chat_id]) {
            map[msg.chat_id] = msg
          }
        }

        setLastMessages(map)

        //  TRI
        const sorted = [...chats].sort(
  (a, b) => {
    // pinned first
    if (
      a.pinned &&
      !b.pinned
    )
      return -1

    if (
      !a.pinned &&
      b.pinned
    )
      return 1
    const aTime =
      map[a.id]?.created_at || 0
    const bTime =
      map[b.id]?.created_at || 0
    return (
      new Date(bTime).getTime() -
      new Date(aTime).getTime()
    )
  }
)
        setSortedChats(sorted)
      }
    fetchLastMessages()

    //  REALTIME
   const channel = supabase
  .channel("sidebar-realtime")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
    },
    (payload) => {
      const newMsg: any = payload.new

      //  refresh sidebar
      fetchLastMessages()

      //  unread logic
      if (
        newMsg.user_email !== user.email &&
        pathname !== `/chat/${newMsg.chat_id}`
      ) {
        notificationSound?.play()
        setUnread((prev) => ({
          ...prev,
          [newMsg.chat_id]:
            (prev[newMsg.chat_id] || 0) + 1,
        }))
      }
    }
  )
  .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chats,pathname])
useEffect(() => {
  const currentChat =
    pathname.split("/chat/")[1]
  if (currentChat) {
    setUnread((prev) => ({
      ...prev,
      [currentChat]: 0,
    }))
  }
}, [pathname])
useEffect(() => {
  if (!user?.email) return
  const setOnline = async () => {
    await supabase
      .from("profiles")
      .update({
        online: true,
      })
      .eq("email", user.email)
  }

  setOnline()
}, [user])
useEffect(() => {
  const handleOffline =
    async () => {
      if (!user?.email) return

      await supabase
        .from("profiles")
        .update({
          online: false,
          last_seen:
            new Date(),
        })
        .eq("email", user.email)
    }
  window.addEventListener(
    "beforeunload",
    handleOffline
  )
  return () => {
    window.removeEventListener(
      "beforeunload",
      handleOffline
    )
  }
}, [user])

  // FILTER
  const filteredChats =
    sortedChats.filter((chat) => {
      try {
        const usersArray = JSON.parse(
          chat.users
        )
        const other =
          usersArray.find(
            (u: string) =>
              u !== user.email
          )

        return other
          ?.toLowerCase()
          .includes(search.toLowerCase())
      } catch {
        return false
      }
    })
if (
  isMobile &&
  pathname.includes("/chat/")
) {
  return null
}
  return (
    <div
      style={{
      width: isMobile ? "100%" : 320,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #ddd",
        background: "#f0f2f5",
      }}  
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          padding: "10px",
          background: "#f0f2f5",
        }}
      >
        <img
         src={
          getAvatar(user.user_metadata)}
          width={45}
          height={45}
          style={{
            borderRadius: "50%",
            cursor: "pointer",
          }} 
          onClick={async () => {
            const confirmLogout =
              confirm("Logout ?")

            if (!confirmLogout) return

            await supabase.auth.signOut()

            router.push("/")
          }}
          onError={(e) => {
    // Fallback si l'image échoue à charger
    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || "U")}&background=random`
  }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <IconButton onClick={createChat}>
            <ChatIcon
              style={{
                color: "#54656f",
              }}
            />
          </IconButton>
          <IconButton
            onClick={handleClick}
          >
            <MoreVertIcon
              style={{
                color: "#54656f",
              }}
            />
          </IconButton>
          <IconButton
  onClick={() =>
    router.push("/group")
  }
>
   <GroupsIcon
    style={{
      color: "#54656f",
    }}
  />
</IconButton>
        </div>
      </div>

      {/* MENU */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose}>
          Profile
        </MenuItem>
        <MenuItem onClick={handleClose}>
          Settings
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose()
            logout()
          }}
        >
          Logout
        </MenuItem>
      </Menu>
      {/* SEARCH */}
      <div style={{ padding: "10px" }}>
        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search chats"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />
      </div>

      {/* CHAT LIST */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        {(search
          ? filteredChats
          : sortedChats
        ).map((chat) => {
          let otherUser = "Unknown"

          try {
  const usersArray = JSON.parse(chat.users)
  // ✅ CORRECT
  if (!chat.is_group) {
    otherUser = usersArray.find((u: string) => u !== user.email) || "Unknown"
  }
} catch {}

          const lastMsg =
            lastMessages[chat.id]

          const isActive =
            pathname ===
            `/chat/${chat.id}`
const togglePin = async (
  chatId: string,
  current: boolean
) => {
  await supabase
    .from("chats")
    .update({
      pinned: !current,
    })
    .eq("id", chatId)
}
          return (
            <div
              key={chat.id}
              onClick={() => {
                localStorage.setItem(
                  "lastChat",
                  chat.id
                )
                router.push(
                  `/chat/${chat.id}`
                )
              }}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px",
                borderBottom:
                  "1px solid #eee",
                cursor: "pointer",
                background: isActive
                  ? "#f0f2f5"
                  : "#fff",
                transition: "0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background =
                    "#f5f6f6"
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background =
                    "#fff"
                }
              }}
            >

              {/* AVATAR */}
              <img
              src={chat.is_group 
  ? `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.group_name)}&background=random`
  : getAvatars(otherUser)
}
onError={(e) => {
  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser || "U")}&background=random`
}}
                width={45}
                height={45}
                style={{
                  borderRadius: "50%",
                  marginRight: "10px",
                  objectFit: "cover",
                }}
              />
              {/* INFOS */}
              <div
                style={{
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                {/* TOP */}
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontWeight: "bold",
                      fontSize: "16px",
                      whiteSpace:
                        "nowrap",
                      overflow:
                        "hidden",
                      textOverflow:
                        "ellipsis",
                    }}
                  >
                    {chat.is_group
  ? chat.group_name
  : otherUser}
                  </p>

                  {/* UNREAD */}
                  {unread[chat.id] >
                    0 && (
                    <div
                      style={{
                        minWidth:
                          "20px",
                        height: "20px",
                        borderRadius:
                          "50%",
                        background:
                          "#25d366",
                        color: "white",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        fontSize:
                          "12px",
                        fontWeight:
                          "bold",
                        padding: "3px",
                      }}
                    >
                      {unread[chat.id]}
                    </div>
                  )}
                </div>
                {/* LAST MESSAGE */}
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "gray",
                    whiteSpace:
                      "nowrap",
                    overflow:
                      "hidden",
                    textOverflow:
                      "ellipsis",
                  }}
                >
                  {lastMsg
  ? lastMsg.audio_url
    ? "🎤 Audio"
    : lastMsg.image_url
    ? "📷 Image"
    : `${
        lastMsg.user_email ===
        user.email
          ? "You: "
          : ""
      }${lastMsg.message}`
  : "No messages yet"}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
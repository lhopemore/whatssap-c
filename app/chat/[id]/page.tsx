"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import SendIcon from "@mui/icons-material/Send"
import { IconButton } from "@mui/material"
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon"
import ImageIcon from "@mui/icons-material/Image"
import MicIcon from "@mui/icons-material/Mic"
import EmojiPicker from "emoji-picker-react"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import MessageBubble from "@/components/MessageBubble"
import ChatHeader from "@/components/ChatHeader"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import CallIcon from "@mui/icons-material/Call"
import VideocamIcon from "@mui/icons-material/Videocam"
type ChatMessage = {
  id: string
  chat_id: string
  message: string | null
  user_email: string | null
  seen: boolean
  created_at: string | Date
  deleted: boolean
  type: string | null
  audio_url: string | null
  image_url: string | null
  reply_to: string | null
}

type IncomingCall = {
  id: string
  chat_id: string
  caller: string
  receiver: string
  type: "audio" | "video"
  created_at: string | Date
}

export default function ChatRoom() {
  const params = useParams()
  const id = params?.id as string

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [otherUser, setOtherUser] = useState("")

  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
const [isMobile, setIsMobile] =
  useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [mediaRecorder, setMediaRecorder] =
    useState<MediaRecorder | null>(null)
  const [recording, setRecording] = useState(false)

  const chunksRef = useRef<Blob[]>([])

  const notificationSound = useMemo(() => {
    if (typeof window === "undefined") return null
    return new Audio("/sounds/notification.mp3")
  }, [])

  const [incomingCall, setIncomingCall] =
    useState<IncomingCall | null>(null)
  const [replyMessage, setReplyMessage] = useState<any>(null)
  const [ephemeral, setEphemeral] =
  useState(false)
  const [search, setSearch] =
  useState("")
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
  // 🔥 USER
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUserEmail(session?.user?.email ?? null)
    }
    getUser()
  }, [])

  // 🔥 FETCH CHAT USER (other participant)
  useEffect(() => {
    const fetchChatUser = async () => {
      if (!id || !userEmail) return

      const { data } = await supabase
        .from("chats")
        .select("*")
        .eq("id", id)
        .single()

      if (!data) return

      try {
        const usersArray: string[] = JSON.parse(data.users)
        const other =
          usersArray.find((u) => u !== userEmail) ?? "Unknown"
        setOtherUser(other)
      } catch {
        setOtherUser("Unknown")
      }
    }

    fetchChatUser()
  }, [id, userEmail])

  // Typing realtime via chats.typing field
  useEffect(() => {
    if (!id || !userEmail) return

    const channel = supabase
      .channel("typing-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chats",
        },
        (payload) => {
          const chat: any = payload.new
          if (chat.id !== id) return
          if (chat.typing && chat.typing !== userEmail) {
            setTyping(true)
          } else {
            setTyping(false)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, userEmail])

  // 🔥 FETCH MESSAGES + REALTIME
  useEffect(() => {
    if (!id) return

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", id)
        .order("created_at", { ascending: true })

      setMessages((data as unknown as ChatMessage[]) || [])
    }

    fetchMessages()

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg =
            payload.new as unknown as ChatMessage
          if (newMsg.chat_id !== id) return
          setMessages((prev) => [...prev, newMsg])
          if (userEmail && newMsg.user_email !== userEmail) {
            notificationSound?.play().catch(() => undefined)
          }
        }
      )
      .on(
  "postgres_changes",
  {
    event: "UPDATE",
    schema: "public",
    table: "messages",
  },
  (payload) => {
    const updatedMsg =
      payload.new as ChatMessage

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === updatedMsg.id
          ? updatedMsg
          : msg
      )
    )
  }
)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, userEmail, notificationSound])

  // 🔥 INCOMING CALLS
  useEffect(() => {
    if (!userEmail) return

    const channel = supabase
      .channel("calls-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "calls",
        },
        (payload) => {
          const call =
            payload.new as unknown as IncomingCall
          if (call.receiver === userEmail) setIncomingCall(call)
        }
      )
      .on(
  "postgres_changes",
  {
    event: "DELETE",
    schema: "public",
    table: "messages",
  },
  (payload) => {
    const deletedMsg =
      payload.old as ChatMessage

    setMessages((prev) =>
      prev.filter(
        (msg) =>
          msg.id !==
          deletedMsg.id
      )
    )
  }
)
.on(
  "postgres_changes",
  {
    event: "UPDATE",
    schema: "public",
    table: "calls",
  },
  (payload) => {
    const call =
      payload.new as IncomingCall

    if (
      call.receiver ===
      userEmail
    ) {
      setIncomingCall(call)
    }
  }
)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userEmail])

  // Mark messages as seen
  useEffect(() => {
    const markAsSeen = async () => {
      if (!userEmail || !id) return
      await supabase
        .from("messages")
        .update({ seen: true })
        .eq("chat_id", id)
        .neq("user_email", userEmail)
    }
    markAsSeen()
  }, [id, userEmail])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages])

  // Typing status table (separate)
  useEffect(() => {
    if (!id || !userEmail) return

    const channel = supabase
      .channel("typing-status")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_status",
        },
        (payload) => {
          const data: any = payload.new
          if (data.chat_id === id && data.user_email !== userEmail) {
            setTyping(Boolean(data.is_typing))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, userEmail])

  const [lastSeen, setLastSeen] = useState<string>("")
  useEffect(() => {
    const fetchStatus = async () => {
      if (!otherUser) return
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", otherUser)
        .single()

      const lastSeenValue = (data as any)?.last_seen
      if (!lastSeenValue) return

      const lastSeenDate =
        lastSeenValue instanceof Date
          ? lastSeenValue
          : new Date(lastSeenValue)
      if (Number.isNaN(lastSeenDate.getTime())) return

      setLastSeen(
        lastSeenDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      )
    }
    fetchStatus()
  }, [otherUser])
  const [isOnline, setIsOnline] = useState(false)
  useEffect(() => {
    const channel = supabase
      .channel("online-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          const profile: any = payload.new
         if (
  profile.email ===
  otherUser
) {
  setIsOnline(
    Boolean(profile.online)
  )

  if (profile.last_seen) {
    setLastSeen(
      new Date(
        profile.last_seen
      ).toLocaleTimeString(
        [],
        {
          hour:
            "2-digit",
          minute:
            "2-digit",
        }
      )
    )
  }
}
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [otherUser])
useEffect(() => {
  const interval =
    setInterval(async () => {
      await supabase
        .from("messages")
        .delete()
        .lt(
          "expires_at",
          new Date().toISOString()
        )
    }, 5000)

  return () =>
    clearInterval(interval)
}, [])
  // 🔥 SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim() || !userEmail || !id) return

    await supabase
  .from("messages")
  .insert([
    {
      chat_id: id,
      message: input,
      user_email: userEmail,
    },
  ])
if (
  otherUser ===
  "AI_ASSISTANT"
) {
  const res = await fetch(
    "/api/ai",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        message: input,
      }),
    }
  )

  const data =
    await res.json()

  await supabase
    .from("messages")
    .insert([
      {
        chat_id: id,
        message:
          data.reply,
        user_email:
          "AI_ASSISTANT",
      },
    ])
}
    await supabase
      .from("chats")
      .update({ typing: "" })
      .eq("id", id)

    setInput("")
    setReplyMessage(null)
    await supabase.from("typing_status").upsert([
      { chat_id: id, user_email: userEmail, is_typing: false },
    ])
  }

  const handleTyping = async (value: string) => {
    setInput(value)
    if (!userEmail || !id) return

    await supabase.from("typing_status").upsert([
      {
        chat_id: id,
        user_email: userEmail,
        is_typing: value.length > 0,
      },
    ])
    clearTimeout(
  (window as any)
    .typingTimeout
)

;(window as any)
  .typingTimeout =
  setTimeout(async () => {
    await supabase
      .from(
        "typing_status"
      )
      .upsert([
        {
          chat_id: id,
          user_email:
            userEmail,
          is_typing: false,
        },
      ])
  }, 1500)
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      sendMessage().catch(() => undefined)
    }
  }

  const sendImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userEmail || !id) return

    setUploading(true)

    const fileName = `${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from("chat-images")
      .upload(fileName, file)

    if (error) {
      console.log(error)
      setUploading(false)
      return
    }

    const { data } = supabase.storage
      .from("chat-images")
      .getPublicUrl(fileName)

    await supabase.from("messages").insert([
      {
        chat_id: id,
        image_url: data.publicUrl,
        user_email: userEmail,
        type: "image",
        reply_to:
      replyMessage?.id || null,
      ephemeral,
    expires_at: ephemeral
      ? new Date(
          Date.now() + 60000
        )
      : null,
      },
    ])

    setUploading(false)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
      const recorder = new MediaRecorder(stream)

      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: "audio/webm",
        })

        const fileName = `${Date.now()}.webm`

        const { error } = await supabase.storage
          .from("chat-audios")
          .upload(fileName, blob)

        if (error) {
          console.log(error)
          return
        }

        const { data } = supabase.storage
          .from("chat-audios")
          .getPublicUrl(fileName)

        if (!userEmail || !id) return
        await supabase.from("messages").insert([
          {
            chat_id: id,
            audio_url: data.publicUrl,
            user_email: userEmail,
            type: "audio",
          },
        ])
      }

      recorder.start()
      setMediaRecorder(recorder)
      setRecording(true)
    } catch (err) {
      console.log(err)
    }
  }

  const stopRecording = () => {
    mediaRecorder?.stop()
    setRecording(false)
  }

  const startCall = async (type: "audio" | "video") => {
    if (!userEmail || !otherUser || !id) return
    await supabase.from("calls").insert([
      {
        chat_id: id,
        caller: userEmail,
        receiver: otherUser,
        type,
      },
    ])
  }

  const deleteMessage = async (messageId: string) => {
    const confirmDelete = confirm("Delete message?")
    if (!confirmDelete) return

    await supabase
      .from("messages")
      .update({
        deleted: true,
        message: "This message was deleted",
      })
      .eq("id", messageId)
  }
const reactToMessage = async (
  messageId: string,
  emoji: string,
  currentReactions: any
) => {
  const updatedReactions = {
    ...currentReactions,
    [userEmail as string]: emoji,
  }

  await supabase
    .from("messages")
    .update({
      reactions:
        updatedReactions,
    })
    .eq("id", messageId)
}

const sendFile = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (!e.target.files?.[0]) return

  const file = e.target.files[0]

  const fileName =
    `${Date.now()}-${file.name}`

  const { error } =
    await supabase.storage
      .from("chat-files")
      .upload(fileName, file)

  if (error) {
    console.log(error)
    return
  }

  const { data } =
    supabase.storage
      .from("chat-files")
      .getPublicUrl(fileName)

  await supabase
    .from("messages")
    .insert([
      {
        chat_id: id,
        user_email: userEmail,
        file_url:
          data.publicUrl,
        file_name: file.name,
      },
    ])
}
const filteredMessages =
  messages.filter((msg) =>
    msg.message
      ?.toLowerCase()
      .includes(
        search.toLowerCase()
      )
  )

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#efeae2",
      }}
    >
      <ChatHeader
        otherUser={otherUser}
        typing={typing}
        onAudioCall={() => startCall("audio")}
        onVideoCall={() => startCall("video")}
        isOnline={isOnline}
        lastSeen={lastSeen}
        isMobile={isMobile}
          search={search}
  setSearch={setSearch}
        onBack={() => {
          window.history.back()
        } }
      />
      {incomingCall && (
        
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            zIndex: 9999,
          }}
        >
          <h3>
            Incoming {incomingCall.type} call
          </h3>
          <p>{incomingCall.caller}</p>
          <button onClick={() => setIncomingCall(null)}>
            Reject
          </button>
        </div>
      )}

      {/* 💬 MESSAGES */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "15px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {filteredMessages.map((msg) => {
          const isMe = msg.user_email === userEmail
          return (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isMe={isMe}
              onReply={setReplyMessage}
  messages={messages}
              onDelete={deleteMessage}
              onReact={reactToMessage}
            />
          )
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* 🔥 INPUT */}
      
      <div
        style={{
          padding: "10px",
          borderTop: "1px solid #ddd",
          background: "#f0f2f5",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          position: "relative",
        }}
      >
        {/* EMOJI BUTTON */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowEmoji((v) => !v)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "24px",
              cursor: "pointer",
            }}
            aria-label="Toggle emoji picker"
            type="button"
          >
            <InsertEmoticonIcon
              style={{ color: "#54656f", fontSize: "28px" }}
            />
          </button>
          {showEmoji && (
            <div
              style={{
                position: "absolute",
                bottom: "50px",
                left: 0,
                zIndex: 1000,
              }}
            >
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setInput((prev) => prev + emojiData.emoji)
                }}
              />
            </div>
          )}
        </div>

        <label
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ImageIcon style={{ color: "#54656f", fontSize: "28px" }} />

          <input
            type="file"
            hidden
            accept="image/*"
            onChange={sendImage}
          />
        </label>
<label
  style={{
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  }}
>
  <AttachFileIcon
    style={{
      color: "#54656f",
      position: "relative",
    }}
  />

  <input
    type="file"
    hidden
    onChange={sendFile}
  />
</label>
        <input
          value={input}
          onChange={async (e) => {
            const value = e.target.value
            await handleTyping(value)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          style={{
            background: "#fff",
            color: "#54656f",
            boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
            border: "1px solid #ddd",
            borderRadius: "25px",
            height: "40px",
            boxSizing: "border-box",
            maxWidth: "600px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            cursor: "text",
            userSelect: "text",
            WebkitUserSelect: "text",
            msUserSelect: "text",
            WebkitTapHighlightColor: "transparent",
            resize: "none",
            overflowY: "auto",
            overflowX: "hidden",
            wordWrap: "break-word",
            hyphens: "auto",
            WebkitHyphens: "auto",
            MozHyphens: "auto",
            msHyphens: "auto",
            outline: "none",
            fontFamily: "Arial, sans-serif",
            fontSize: "15px",
            lineHeight: "1.5",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            
          }}
        />

        {/* MICRO DANS INPUT */}
        <button
          type="button"
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
          aria-label="Hold to record audio"
          disabled={uploading}
        >
          <MicIcon style={{ color: "#54656f", fontSize: "28px" }} />
        </button>

        <IconButton
          onClick={() => sendMessage().catch(() => undefined)}
          style={{
            background: "#25d366",
            color: "white",
          }}
          disabled={uploading || recording}
          aria-label="Send message"
        >
          <SendIcon />
        </IconButton>
      </div>
    </div>
  )
}

import TimerIcon from "@mui/icons-material/Timer"
type Props = {
  msg: any
  isMe: boolean

  onDelete?: (
    messageId: string
  ) => Promise<void>

  onReply: (msg: any) => void

  messages: any[]

  onReact: (
    id: string,
    emoji: string,
    reactions: any
  ) => void
}

export default function MessageBubble({
  msg,
  isMe,
  onReply,
  messages,
  onDelete,
  onReact,
}: Props) {
  const repliedMessage =
    messages.find(
      (m) =>
        m.id === msg.reply_to
    )

  return (
    
    <div
      style={{
        display: "flex",
        justifyContent: isMe
          ? "flex-end"
          : "flex-start",
        marginBottom: "10px",
      }}
    >
      <div
        style={{
          background: isMe
            ? "#dcf8c6"
            : "#fff",
          padding: "10px",
          borderRadius: "10px",
          maxWidth: "60%",
          boxShadow:
            "0 1px 1px rgba(0,0,0,0.08)",
          wordBreak:
            "break-word",
        }}
      >
        {/* EMAIL */}
        {!isMe && (
          <p
            style={{
              fontSize: "11px",
              margin: 0,
              marginBottom: "5px",
              color: "#667781",
              fontWeight: "bold",
            }}
          >
            {msg.user_email}
          </p>
        )}

        {/* REPLY PREVIEW */}
        {repliedMessage && (
          <div
            style={{
              background:
                "rgba(0,0,0,0.06)",
              padding: "6px",
              borderRadius: "8px",
              marginBottom:
                "5px",
              borderLeft:
                "4px solid #25d366",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize:
                  "12px",
                color:
                  "#667781",
              }}
            >
              {
                repliedMessage.user_email
              }
            </p>

            <p
              style={{
                margin: 0,
                fontSize:
                  "13px",
              }}
            >
              {repliedMessage.message ||
                "📷 Media"}
            </p>
          </div>
        )}

        {/* FILE */}
        {msg.file_url ? (
          <a
            href={msg.file_url}
            target="_blank"
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: "10px",
              textDecoration:
                "none",
                margin: "10px 0",
              color: "#111",
              background:
                "#f0f2f5",
              left: "30px",
              borderRadius:
                "10px",
            }}
          >
            📄

            <span>
              {msg.file_name}
            </span>
          </a>
        ) : msg.audio_url ? (
          /* AUDIO */
          <audio
            controls
            src={msg.audio_url}
            style={{
              width: "250px",
            }}
          />
        ) : msg.image_url ? (
          /* IMAGE */
          <img
            src={msg.image_url}
            style={{
              maxWidth:
                "250px",
              borderRadius:
                "10px",
            }}
          />
        ) : (
          /* TEXT */
          <p
            style={{
              margin: 0,
            }}
          >
            {msg.deleted
              ? "🚫 This message was deleted"
              : msg.message}
          </p>
        )}

        {/* REACTIONS */}
        
        {/* ACTIONS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginTop: "5px",
            flexWrap: "wrap",
          }}
        >
          {/* REPLY */}

          {/* REACTIONS BUTTONS */}
          

          {/* DELETE */}
          {isMe &&
            onDelete &&
            !msg.deleted && (
              <button
                onClick={() =>
                  onDelete(
                    String(
                      msg.id
                    )
                  )
                }
                style={{
                  border:
                    "none",
                  background:
                    "transparent",
                  cursor:
                    "pointer",
                  fontSize:
                    "12px",
                }}
              >
                🗑
              </button>
            )}

          {/* TIME */}
          <span
            style={{
              fontSize: "10px",
              color: "#667781",
              marginLeft: "auto",
            }}
          >
            {new Date(
              msg.created_at
            ).toLocaleTimeString(
              [],
              {
                hour:
                  "2-digit",
                minute:
                  "2-digit",
              }
            )}
          </span>
{msg.ephemeral && (
  <span
    style={{
      fontSize: "10px",
      color: "#667781",
      marginLeft: "5px",
    }}
  >
    <TimerIcon
  style={{
    fontSize: "12px",
    verticalAlign: "middle",
    color: "#667781",
    marginRight: "5px",
  }}
/>
  <span
  style={{
    fontSize: "10px",
    color: "#667781",
  }}
/>
  </span>
)}

          {/* SEEN */}
          {isMe && (
            <span
              style={{
                fontSize:
                  "12px",
                color: msg.seen
                  ? "#53bdeb"
                  : "#667781",
              }}
            >
              {msg.seen
                ? "✓✓"
                : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
import SearchIcon from "@mui/icons-material/Search"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { IconButton } from "@mui/material"
import CallIcon from "@mui/icons-material/Call"
import VideocamIcon from "@mui/icons-material/Videocam"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import DonutLargeIcon from "@mui/icons-material/DonutLarge"
type Props = {
  otherUser: string
  typing: boolean
  onBack: () => void
isMobile: boolean
  onAudioCall: () => void
  onVideoCall: () => void
  isOnline: boolean
  lastSeen: string
  search: string
setSearch: any
}
export default function ChatHeader({
  otherUser,
  typing,
   onBack,
  isMobile,
    onAudioCall,
    onVideoCall,
     search,
  setSearch,
  isOnline,
  lastSeen,
}: Props) {
  return (
    <div
      style={{
        height: "60px",
        background: "#f0f2f5",
        display: "flex",
        alignItems: "center",
        justifyContent:
          "space-between",
        padding: "0 15px",
        borderBottom: "1px solid #ddd",
      }}
    >
      {/* LEFT */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        {isMobile && (
  <IconButton onClick={onBack}>
    <ArrowBackIcon />
  </IconButton>
)}
        <img
          src={`https://ui-avatars.com/api/?name=${otherUser || "User"}`}
          width={40}
          height={40}
          style={{
            borderRadius: "50%",
            marginRight: "10px",
            objectFit: "cover",
          }}
        />
        <div>
          <strong>{otherUser}</strong>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#667781",
            }}
          >
            {typing ? "typing..." : "online"}
          </p>
        </div>
      </div>
      {/* RIGHT */}
      <input
  value={search}
  onChange={(e) =>
    setSearch(e.target.value)
  }
  placeholder="Search..."
  style={{
    padding: "8px",
    borderRadius: "20px",
    border: "none",
    outline: "none",
    background: "#fff",
  }}
/>
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
      ></div>
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "5px",
  }}
>
  <IconButton
    onClick={onAudioCall}
  >
    <CallIcon
      style={{
        color: "#54656f",
      }}
    />
  </IconButton>
  <IconButton
    onClick={onVideoCall}
  >
    <VideocamIcon
      style={{
        color: "#54656f",
      }}
    />
  </IconButton>
  <IconButton>
    <MoreVertIcon
      style={{
        color: "#54656f",
      }}
    />
  </IconButton>
  <IconButton
  onClick={() =>
    document
      .getElementById("image-upload")
      ?.click()
  }
>
  <DonutLargeIcon
    style={{
      color: "#54656f",
    }}
  />
</IconButton>

</div>
    </div>
  )
}
"use client"

import { CircleLoader } from "react-spinners"

export default function ChatLoading() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <CircleLoader color="#25D366" size={60} />
    </div>
  )
}

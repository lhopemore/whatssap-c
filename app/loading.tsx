"use client"

import { CircleLoader } from "react-spinners"
export default function Loading() {
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        height: "100vh",
        backgroundColor: "#fff",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {/* Logo WhatsApp */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="logo"
          height={200}
          style={{ marginBottom: 20 }}
        />
        {/* Spinner */}
        <CircleLoader color="#25D366" size={60} />
      </div>
    </div>
  )
}
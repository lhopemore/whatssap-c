"use client"

import { useEffect } from "react"

export default function ChatError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
      <button onClick={() => reset()} style={{ padding: "10px 20px", cursor: "pointer" }}>
        Try again
      </button>
    </div>
  )
}

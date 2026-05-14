"use client"

export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Oops — Something went wrong.</h1>
      <p>{error.message}</p>
      <button
        onClick={() => reset()}
        style={{ padding: "0.75rem 1.25rem", marginTop: "1rem", cursor: "pointer" }}
      >
        Try again
      </button>
    </div>
  )
}

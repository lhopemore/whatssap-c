"use client"

import { supabase } from "../lib/supabaseClient"

export default function Login() {
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/chat",
      },
    })
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
      }}
    >
      <div
        style={{
          width: "200px",
          backgroundColor: "white",
          padding: "20px 20px",
          borderRadius: "12px",
          boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        {/* LOGO */}
        <div style={{ marginBottom: "20px" }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            width={100}
            height={100}
            style={{ objectFit: "contain" }}
          />
        </div>

        <p style={{ fontSize: "14px", color: "#667781", marginBottom: "25px" }}>
          Connectez-vous pour continuer
        </p>

        {/* BUTTON */}
        <button
          onClick={loginWithGoogle}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "25px",
            border: "none",
            backgroundColor: "#25D366",
            color: "white",
            fontSize: "15px",
            cursor: "pointer",
            transition: "0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#20bd5a"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#25D366"
          }}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
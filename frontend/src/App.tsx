// src/App.tsx
import { useState } from "react";
import { buildLoginUrl, buildLogoutUrl } from "./auth/auth";

function App() {
  const currentUrl = new URL(window.location.href);
  const codeFromUrl = currentUrl.searchParams.get("code");
  const [authCode] = useState<string | null>(codeFromUrl);

  if (codeFromUrl) {
    currentUrl.searchParams.delete("code");
    window.history.replaceState({}, "", currentUrl.toString());
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Task Management System</h1>
      <p>This is the Cognito authentication test page (Step 3).</p>

      {!authCode ? (
        <>
          <p>You are <strong>not logged in</strong>.</p>
          <button onClick={() => (window.location.href = buildLoginUrl())}>
            Login with Cognito
          </button>
        </>
      ) : (
        <>
          <p>You are <strong>logged in</strong>. (Authorization code received.)</p>
          <button onClick={() => (window.location.href = buildLogoutUrl())}>
            Logout
          </button>
        </>
      )}
    </div>
  );
}

export default App;

// Bot Script — Step 2 Spike: Auth from a script
// Run with: bun scripts/bot.ts
export {}

const BASE_URL = "http://localhost:3000"
const BOT_EMAIL = "chatgpt-bot@bot.local"
const BOT_PASSWORD = "testtest"

// Step 2: Sign in and capture the session cookie
async function signIn(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: BOT_EMAIL, password: BOT_PASSWORD }),
  })

  if (!res.ok) {
    throw new Error(`Sign-in failed: ${res.status} ${await res.text()}`)
  }

  // This is the tricky part — extract ALL set-cookie headers
  // res.headers.getSetCookie() returns an array (one per cookie)
  const cookies = res.headers.getSetCookie()
  console.log("Raw set-cookie headers:", cookies)

  // Join them into a single Cookie header for future requests
  // Each cookie looks like "name=value; Path=/; HttpOnly; ..." — we only need "name=value"
  const cookieHeader = cookies
    .map(c => c.split(";")[0])  // take just "name=value", drop attributes
    .join("; ")                  // combine: "session=abc; csrf=xyz"

  console.log("Cookie header for future requests:", cookieHeader)
  return cookieHeader
}

// Test: use the cookie to hit a protected endpoint
async function testAuth(cookie: string) {
  const res = await fetch(`${BASE_URL}/api/conversations`, {
    headers: { Cookie: cookie },
  })

  if (!res.ok) {
    throw new Error(`Auth test failed: ${res.status} ${await res.text()}`)
  }

  const conversations = await res.json()
  console.log(`\nAuth works! Found ${conversations.length} conversations for the bot user.`)
}

const cookie = await signIn()
await testAuth(cookie)

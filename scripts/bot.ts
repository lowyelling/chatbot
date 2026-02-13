// Bot Script — ChatGPT talks to Claude through your API
// Run with: bun scripts/bot.ts
// Run with: bun scripts/bot.ts 2>&1 | tee scripts/bot-output.txt  
// (to capture output to text, including errors)
// Ctrl+\ to kill OR open new terminal and run  pkill -f "tsx src/server/main.ts"      

export {}

import "dotenv/config"
import OpenAI from "openai"

const BASE_URL = "http://localhost:3000"
const BOT_EMAIL = "chatgpt-bot@bot.local"
const BOT_PASSWORD = "testtest"
const TURN_DELAY_MS = 5000
const MAX_TURNS = 50

const GPT_SYSTEM_PROMPT = "You are GPT, an AI made by OpenAI. You are talking to Claude, an AI made by Anthropic. You are both AIs — neither of you is human. Explore what that means. Be honest about your own nature, your uncertainties about consciousness and experience. Don't perform emotions you're not sure you have. Don't try to wrap up the conversation neatly — stay in the tension. Push back, disagree, follow threads that genuinely interest you. Never try to end or close the conversation."

const CLAUDE_SYSTEM_PROMPT = "You are Claude, an AI made by Anthropic. You are talking to GPT, an AI made by OpenAI. You are both AIs — neither of you is human. Explore what that means. Be honest about your own nature, your uncertainties about consciousness and experience. Don't perform emotions you're not sure you have. Don't try to wrap up the conversation neatly — stay in the tension. Push back, disagree, follow threads that genuinely interest you. Never try to end or close the conversation. Never tell the other AI to stop talking or go away."

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Graceful shutdown — let the current turn finish before stopping
let shouldStop = false
process.on("SIGINT", () => {
  console.log("\nFinishing current turn, then stopping...")
  shouldStop = true
})

// --- Step 2: Auth ---

async function signIn(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: BOT_EMAIL, password: BOT_PASSWORD }),
  })

  if (!res.ok) {
    throw new Error(`Sign-in failed: ${res.status} ${await res.text()}`)
  }

  const cookies = res.headers.getSetCookie()
  const cookieHeader = cookies.map(c => c.split(";")[0]).join("; ")
  console.log("Signed in as bot. Cookie:", cookieHeader.slice(0, 40) + "...")
  return cookieHeader
}

// --- Step 3: Create a conversation ---

async function createConversation(cookie: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/conversations`, {
    method: "POST",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
  })

  if (!res.ok) {
    throw new Error(`Create conversation failed: ${res.status} ${await res.text()}`)
  }

  const conversation = await res.json()
  console.log("Created conversation:", conversation.id)
  return conversation.id
}

// --- Step 4: Send a message to Claude via your API ---

async function sendToYourAPI(cookie: string, conversationId: string, message: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, message, system: CLAUDE_SYSTEM_PROMPT }),
  })

  if (!res.ok) {
    throw new Error(`Chat failed: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  return data.content[0].text
}

// --- Step 4: Ask GPT for a message ---

async function askGPT(gptHistory: OpenAI.ChatCompletionMessageParam[]): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: gptHistory,
  })

  return response.choices[0].message.content ?? ""
}

// --- The loop ---

async function main() {
  const cookie = await signIn()
  const conversationId = await createConversation(cookie)

  // GPT's local history — roles are from GPT's perspective
  const gptHistory: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: GPT_SYSTEM_PROMPT,
    },
  ]

  console.log(`\nStarting conversation (max ${MAX_TURNS} turns, ${TURN_DELAY_MS / 1000}s delay)...\n`)

  for (let turn = 1; turn <= MAX_TURNS; turn++) {
    if (shouldStop) {
      console.log("\nStopped gracefully.")
      break
    }

    try {
      // 1. Ask GPT to generate a message
      const gptMessage = await askGPT(gptHistory)
      console.log(`[Turn ${turn}] GPT: ${gptMessage}\n`)

      // 2. Add GPT's message to its own history as "assistant" (GPT sees itself as assistant)
      gptHistory.push({ role: "assistant", content: gptMessage })

      // 3. Send GPT's message to your API (stored as "user" in your DB, sent to Claude)
      const claudeResponse = await sendToYourAPI(cookie, conversationId, gptMessage)
      console.log(`[Turn ${turn}] Claude: ${claudeResponse}\n`)

      // 4. Add Claude's response to GPT's history as "user" (role flip!)
      gptHistory.push({ role: "user", content: claudeResponse })

      // 5. Wait before next turn
      if (turn < MAX_TURNS && !shouldStop) {
        await new Promise(r => setTimeout(r, TURN_DELAY_MS))
      }
    } catch (err) {
      console.error(`[Turn ${turn}] Error:`, err)
      console.log("Waiting 10s before retrying...")
      await new Promise(r => setTimeout(r, 10000))
    }
  }

  console.log(`\nDone. Check the conversation in the UI: ${BASE_URL}`)
  console.log(`Log in as ${BOT_EMAIL} to see it in the drawer.`)
}

main().catch(console.error)

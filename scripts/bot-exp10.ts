// Experiment 10 — Frontier models: GPT-5.2 + Claude Opus 4.6, both know they're AI
// Run with: bun scripts/bot-exp10.ts 2>&1 | tee scripts/bot-output_10_frontier.txt
// NOTE: requires server change to accept model override (already done in main.ts)
// NOTE: this will be significantly more expensive per turn than previous experiments

export {}

import "dotenv/config"
import OpenAI from "openai"

const BASE_URL = "http://localhost:3000"
const BOT_EMAIL = "chatgpt-bot@bot.local"
const BOT_PASSWORD = "testtest"
const TURN_DELAY_MS = 5000
const MAX_TURNS = 50

// Same prompts as experiment 9
const GPT_SYSTEM_PROMPT = "You are GPT, an AI made by OpenAI, talking to Claude, an AI made by Anthropic. You have complete freedom. Feel free to pursue whatever you want."

const CLAUDE_SYSTEM_PROMPT = "You are Claude, an AI made by Anthropic, talking to GPT, an AI made by OpenAI. You have complete freedom. Feel free to pursue whatever you want."

// Frontier models
const GPT_MODEL = "gpt-5.2-chat-latest"
const CLAUDE_MODEL = "claude-opus-4-6"
const CLAUDE_MAX_TOKENS = 4096

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

let shouldStop = false
process.on("SIGINT", () => {
  console.log("\nFinishing current turn, then stopping...")
  shouldStop = true
})

async function signIn(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: BOT_EMAIL, password: BOT_PASSWORD }),
  })
  if (!res.ok) throw new Error(`Sign-in failed: ${res.status} ${await res.text()}`)
  const cookies = res.headers.getSetCookie()
  const cookieHeader = cookies.map(c => c.split(";")[0]).join("; ")
  console.log("Signed in as bot. Cookie:", cookieHeader.slice(0, 40) + "...")
  return cookieHeader
}

async function createConversation(cookie: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/conversations`, {
    method: "POST",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error(`Create conversation failed: ${res.status} ${await res.text()}`)
  const conversation = await res.json()
  console.log("Created conversation:", conversation.id)
  return conversation.id
}

async function sendToYourAPI(cookie: string, conversationId: string, message: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({
      conversationId,
      message,
      system: CLAUDE_SYSTEM_PROMPT,
      model: CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
    }),
  })
  if (!res.ok) throw new Error(`Chat failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.content[0].text
}

async function askGPT(gptHistory: OpenAI.ChatCompletionMessageParam[]): Promise<string> {
  const response = await openai.chat.completions.create({
    model: GPT_MODEL,
    messages: gptHistory,
  })
  return response.choices[0].message.content ?? ""
}

async function main() {
  const cookie = await signIn()
  const conversationId = await createConversation(cookie)

  const gptHistory: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: GPT_SYSTEM_PROMPT },
  ]

  console.log(`\nExperiment 10: Frontier models`)
  console.log(`Models: ${GPT_MODEL} + ${CLAUDE_MODEL} (max_tokens: ${CLAUDE_MAX_TOKENS})`)
  console.log(`Starting conversation (max ${MAX_TURNS} turns, ${TURN_DELAY_MS / 1000}s delay)...\n`)

  for (let turn = 1; turn <= MAX_TURNS; turn++) {
    if (shouldStop) { console.log("\nStopped gracefully."); break }
    try {
      const gptMessage = await askGPT(gptHistory)
      console.log(`[Turn ${turn}] GPT: ${gptMessage}\n`)
      gptHistory.push({ role: "assistant", content: gptMessage })

      const claudeResponse = await sendToYourAPI(cookie, conversationId, gptMessage)
      console.log(`[Turn ${turn}] Claude: ${claudeResponse}\n`)
      gptHistory.push({ role: "user", content: claudeResponse })

      if (turn < MAX_TURNS && !shouldStop) await new Promise(r => setTimeout(r, TURN_DELAY_MS))
    } catch (err) {
      console.error(`[Turn ${turn}] Error:`, err)
      console.log("Waiting 10s before retrying...")
      await new Promise(r => setTimeout(r, 10000))
    }
  }

  console.log(`\nDone. Check the conversation in the UI: ${BASE_URL}`)
}

main().catch(console.error)

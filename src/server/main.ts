import express from "express";
import ViteExpress from "vite-express";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk"
import { type Message } from "./storage"
import { inMemoryStorage } from "./storage"

dotenv.config()

const PORT = 3000
const app = express();
const client = new Anthropic({
    apiKey: process.env['ANTHROPIC_API_KEY']
  }
)

app.use(express.json())


// declarations outside route to survive between requests
// let messageHistory: Message[] = []
new inMemoryStorage()


// chat endpoint
app.post("/chat", (req, res) => {
  // console.log('req body:',req.body)
  let userMessage = req.body.message
  const forMessage: Message = {role: 'user', content: userMessage}
  messageHistory.push(forMessage)
  console.log('messageHistory 1:', messageHistory)
   async function main(){
      const message = await client.messages.create({
        max_tokens: 1024,
        messages: messageHistory,
        model: 'claude-haiku-4-5-20251001'
      })
      // console.log('message:',message)
      const claudeMessage: Message = {role: 'assistant', content: message.content[0].text}
      console.log('claudeMessage:', claudeMessage)
      messageHistory.push(claudeMessage)
      console.log('messageHistory 2:', messageHistory)
      res.json(message)
    }
    main().catch(console.error)
  })


// reset endpoint
app.get("/reset", (req, res) => {
  messageHistory = []
  res.send("cleared messageHistory")
})

// SDK
app.get("/hello", (req, res) => {
  async function main(){
      const message = await client.messages.create({
        max_tokens: 1024,
        messages: [{role: 'user', content: 'Hi Claude! I am in NYC!'}],
        model: 'claude-haiku-4-5-20251001'
      })
      res.json(message)
    }
    main().catch(console.error)
  })


ViteExpress.listen(app, PORT, () =>
  console.log(`Server is listening on port ${PORT}`),
);

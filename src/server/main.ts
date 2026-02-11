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
// let conversation.messages: Message[] = []
const storage = new inMemoryStorage()


// chat endpoint
app.post("/chat", (req, res) => {
  // console.log('req body:',req.body)
  const { conversationId, message } = req.body ?? {} 
  const conversation = storage.getConversation(conversationId)
  if (!conversation){
      res.status(404).json({"error": "Conversation not found"})
      return
  }
  let userMessage = message
  const forMessage: Message = {role: 'user', content: userMessage}
  storage.addMessagetoConversation(conversationId, forMessage)
  console.log('conversation.messages 1:', conversation.messages)
   async function main(){
      const message = await client.messages.create({
        max_tokens: 1024,
        messages: conversation!.messages,
        model: 'claude-haiku-4-5-20251001'
      })
      // console.log('message:',message)
      if (message.content[0].type !== 'text'){
         res.status(404).json({"error": "Type is not TextBlock"})
        return
      }
      const claudeMessage: Message = {role: 'assistant', content: message.content[0].text}
      console.log('claudeMessage:', claudeMessage)
      storage.addMessagetoConversation(conversationId, claudeMessage)
      console.log('conversation.messages 2:', conversation!.messages)
      res.json(message)
    }
    main().catch(console.error)
  })


// reset endpoint
app.get("/reset", (req, res) => {
  storage.addMessagetoConversation()
  res.send("cleared conversation.messages")
})


ViteExpress.listen(app, PORT, () =>
  console.log(`Server is listening on port ${PORT}`),
);

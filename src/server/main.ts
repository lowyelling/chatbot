import express from "express";
import ViteExpress from "vite-express";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk"
import { type Message } from "./storage"
import { inMemoryStorage } from "./storage"
import { SQliteStorage } from "./sqlite-storage"

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

// const storage = new inMemoryStorage()
const storage = new SQliteStorage('foobar.db') // pass in a real db name

function createConversationHandler(req: express.Request, res: express.Response) {
  const conversation = storage.createConversation()
  res.status(201).json(conversation)
}

// conversations endpoints
app.post("/api/conversations", createConversationHandler)

app.get("/api/conversations", (req, res) => {
  let conversationList = storage.getConversations()
  res.json(conversationList)
})

// chat endpoint
app.post("/api/chat", (req, res) => {
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
  const updated = storage.getConversation(conversationId)  // re-fetch after the INSERT
  // then use updated.messages instead of conversation.messages when calling Claude
  // doesn't affect in-memory - an extra redundant read for in-memory, but without it, conversation object is already stale       
  // console.log('conversation.messages 1:', conversation.messages)
   async function main(){
      const message = await client.messages.create({
        max_tokens: 1024,
        messages: updated!.messages,
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


// reset endpoint - not needed! just created a new conversation in the future, old ones stick around in sidebar
// app.get("/reset", (req, res) => {
//   const { conversationId, message } = req.body ?? {} 
//   const conversation = storage.getConversation(conversationId)
//   if (!conversation){
//     res.status(404).json({"error": "Conversation not found"})
//     return
//   }
//   storage.addMessagetoConversation(conversationId, message)
//   res.send("cleared conversation.messages")
// })


ViteExpress.listen(app, PORT, () =>
  console.log(`Server is listening on port ${PORT}`),
);

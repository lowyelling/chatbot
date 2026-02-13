import express from "express";
import ViteExpress from "vite-express";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk"
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";
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

// This MUST come before express.json() or auth requests hang
app.all("/api/auth/{*any}", toNodeHandler(auth));  // Express v5 wildcard syntax

app.use(express.json())


// auth middleware 

async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.locals.user = session.user;  // now every handler can read res.locals.user.id
  next();
}

// declarations outside route to survive between requests
// let conversation.messages: Message[] = []

// const storage = new inMemoryStorage()
const storage = new SQliteStorage('foobar.db') // pass in a real db name

function createConversationHandler(req: express.Request, res: express.Response) {
  const conversation = storage.createConversation(res.locals.user.id)
  res.status(201).json(conversation)
}

// conversations endpoints
app.post("/api/conversations", requireAuth, createConversationHandler)

app.get("/api/conversations", requireAuth, (req, res) => {
  let conversationList = storage.getConversations(res.locals.user.id)
  res.json(conversationList)
})

// chat endpoint
app.post("/api/chat", requireAuth, (req, res) => {
  // console.log('req body:',req.body)
  const { conversationId, message } = req.body ?? {} 
  const conversation = storage.getConversation(conversationId, res.locals.user.id)
  if (!conversation){
      res.status(404).json({"error": "Conversation not found"})
      return
  }
  let userMessage = message
  const forMessage: Message = {role: 'user', content: userMessage}
  storage.addMessagetoConversation(conversationId, res.locals.user.id, forMessage)
  const updated = storage.getConversation(conversationId, res.locals.user.id)  // re-fetch after the INSERT
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
      storage.addMessagetoConversation(conversationId, res.locals.user.id, claudeMessage)
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

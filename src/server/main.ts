import express from "express";
import ViteExpress from "vite-express";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk"

dotenv.config()

const PORT = 3000
const app = express();
const client = new Anthropic({
    apiKey: process.env['ANTHROPIC_API_KEY']
  }
)

app.use(express.json())

export type Message = {
  role: 'user' | 'assistant';
  content: string
}

// declarations outside route to survive between requests
let messageHistory: Message[] = []

//  messages: [{role: 'user', content: 'Hi Claude! I am in NYC!'}]

// chatendpoint toy
// app.post("/chat", (req, res) => {
//   console.log('req body:',req.body)
//   res.json({'status': 'ok'})
// })


// // chat endpoint
app.post("/chat", (req, res) => {
  console.log('req body:',req.body)
  let userMessage = req.body.message
  const forMessage: Message = {role: 'user', content: userMessage}
  messageHistory.push(forMessage)
   async function main(){
      const message = await client.messages.create({
        max_tokens: 1024,
        messages: messageHistory,
        model: 'claude-haiku-4-5-20251001'
      })
      res.json(message)
    }
    main().catch(console.error)
  })



// // reset endpoint
// app.get("/reset", (req, res) => {

// })

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


// Node Fetch
// app.get("/hello", (req, res) => {
//   async function main(){
//       const body = {
//          "model": "claude-haiku-4-5-20251001",
//           "max_tokens": 1000,
//           "messages": [
//               {
//                 "role": "user", 
//                 "content": `What is the capital of America? Tell me some facts`
//               }
//           ]
//       }

//    const response = await fetch('https://api.anthropic.com/v1/messages', 
//     { method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-api-key': process.env.ANTHROPIC_API_KEY!,
//         'anthropic-version': '2023-06-01'
//         },
//       body: JSON.stringify(body)
//     })
//     const data = await response.json()
//     console.log('data:', data)
//     res.json(data)
//   }

//   main().catch(console.error)
// })

// basic hello

// app.get("/hello", (_, res) => {
//   res.send("Hello Vite + React + TypeScript!");
// });


ViteExpress.listen(app, PORT, () =>
  console.log(`Server is listening on port ${PORT}`),
);

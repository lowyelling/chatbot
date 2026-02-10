import express from "express";
import ViteExpress from "vite-express";
import dotenv from "dotenv";
dotenv.config()
const PORT = 3000
const app = express();

// app.get("/hello", (_, res) => {
//   res.send("Hello Vite + React + TypeScript!");
// });

app.get("/hello", (req, res) => {
  async function main(){
      const body = {
         "model": "claude-haiku-4-5-20251001",
          "max_tokens": 1000,
          "messages": [
              {
                "role": "user", 
                "content": `What is the capital of America? Tell me some facts`
              }
          ]
      }

   const response = await fetch('https://api.anthropic.com/v1/messages', 
    { method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
        },
      body: JSON.stringify(body)
    })
    const data = await response.json()
    console.log('data:', data)
    res.json(data)
  }

  main().catch(console.error)
})

ViteExpress.listen(app, PORT, () =>
  console.log(`Server is listening on port ${PORT}`),
);

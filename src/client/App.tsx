import "./App.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {type Conversation} from "../server/storage.js"
import { authClient } from "../lib/auth-client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"



function App() {
  const [text, setText] = useState("")
  // const [conversationId, setConversationId] = useState<string | null >(null)
  const [conversationList, setConversationList] = useState<Conversation[]>([])

  const navigate = useNavigate()
  const chatId = useParams().chatId
  const session = authClient.useSession()
  const isBot = session.data?.user?.email === "chatgpt-bot@bot.local"

  useEffect(() => {
    fetchConversationList()
  }, [])

  async function handleLogout(){
    await authClient.signOut(
      {fetchOptions: {
          onSuccess: () => {
            navigate("/") // redirect to login page
          }
        }
      }  
    )
  }

  function fetchConversationList(){
    fetch('/api/conversations')
      .then(response => {
        if (!response.ok) return navigate("/")
        return response.json()
      })
      .then(data => (
        // console.log('data',data),
        setConversationList(data)
      ))
      .catch(error => console.error('Error:', error))
  }


  function handleNewConversation(){
    fetch('/api/conversations', { method: 'POST'})
      .then(response => {
        // console.log('response:', response),
        if (!response.ok) return navigate("/")
        return response.json()
      })
      .then(data => (
        // console.log('data:', data),
        setConversationList([...conversationList, data]),
        navigate(`/chat/${data.id}`)
        // setConversationId(`/chat/${chatId}`)
      ))
      .catch(error => console.error('Error:', error))
  }

   async function handleSend(){                                                                                                                                                           
    let targetId = chatId                                                                                                                                                                
                                                                                                                                                                                         
    if (!targetId) {                                                                                                                                                                     
      const res = await fetch('/api/conversations', { method: 'POST' })
      if (!res.ok) return navigate("/")
      const newConv = await res.json()
      setConversationList(prev => [...prev, newConv])
      targetId = newConv.id
      navigate(`/chat/${targetId}`)
    }

    setConversationList(prev =>
      prev.map(conv => {
        if (conv.id === targetId) {
          return { ...conv, messages: [...conv.messages, { role: 'user', content: text, createdAt: new Date().toISOString() }] }
        }
        return conv
      })
    )

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({conversationId: targetId, message: text})
    })
    if (!response.ok) return navigate("/")
    const data = await response.json()
    const role = data.role
    const content = data.content[0].text
    const newMessage = {role, content}
    setConversationList(prev =>
      prev.map(conv => {
        if (conv.id === targetId) {
          return {...conv, messages: [...conv.messages, newMessage]}
        }
        return conv
      })
    )
    setText("")
  }

  const currentConversation = conversationList.find(conv => conv.id === chatId)
  const messages = currentConversation?.messages ?? []

  return (
    <div className="h-screen flex flex-col max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b">
        <div className="flex items-center gap-2 flex-1">
          <Drawer direction="left">
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm">Conversations</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Conversations</DrawerTitle>
                <DrawerDescription>Select or start a conversation</DrawerDescription>
              </DrawerHeader>
              <div className="flex flex-col gap-2 p-4">
                <Button onClick={() => handleNewConversation()}>New Conversation</Button>
                {conversationList.map(conv => (
                  <Button
                    key={conv.id}
                    variant={conv.id === chatId ? "default" : "outline"}
                    onClick={() => navigate(`/chat/${conv.id}`)}
                    className="justify-start text-left truncate"
                  >
                    {(() => {
                      const date = new Date(conv.createdAt)
                      const dateStr = `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(2)}`
                      const preview = conv.messages[0]?.content.slice(0, 30) || "New conversation"
                      return `${dateStr} - ${preview}${conv.messages[0]?.content.length > 30 ? "..." : ""}`
                    })()}
                  </Button>
                ))}
              </div>
            </DrawerContent>
          </Drawer>
          <Button variant="outline" size="sm" onClick={() => navigate("/new")}>New Chat</Button>
        </div>

        <h1 className="text-lg font-bold">❤️ Lily's Chatbot 🤖</h1>

        <div className="flex-1 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => handleLogout()}>Logout</Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="flex flex-col gap-2">
          {messages.map((msg, index) => (
              <div key={index} className={`message-row ${msg.role === "user" ? "message-row-user" : "message-row-assistant"}`}>
                <div className={`message-bubble ${msg.role === "user" ? (isBot ? "message-bot" : "message-user") : "message-assistant"}`}>
                  <div className="prose">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                {msg.createdAt && (
                  <span className="message-timestamp">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                )}
              </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="px-4 py-3 border-t flex gap-2 items-end">
        <Textarea
          id="box"
          name="box"
          placeholder="Send a message..."
          value={text}
          className="flex-1 min-h-[2.5rem] max-h-40 resize-none"
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              handleSend()
            }
          }}
        />
        <Button onClick={() => handleSend()}>Send</Button>
      </div>

    </div>
  )
}

export default App;

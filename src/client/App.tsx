import "./App.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
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
  // console.log('useParams chatId', chatId)

  useEffect(() => {
    fetchConversationList()
  }, [])


  function fetchConversationList(){
    fetch('/api/conversations')
      .then(response => response.json())
      .then(data => (
        // console.log('data',data),
        setConversationList(data)
      ))
      .catch(error => console.error('Error:', error))
  }


  function handleNewConversation(){
    fetch('/api/conversations', { method: 'POST'})
      .then(response => (
        // console.log('response:', response),
        response.json()
      ))
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
      const newConv = await res.json()
      setConversationList(prev => [...prev, newConv])
      targetId = newConv.id
      navigate(`/chat/${targetId}`)
    }

    setConversationList(prev =>
      prev.map(conv => {
        if (conv.id === targetId) {
          return { ...conv, messages: [...conv.messages, { role: 'user', content: text }] }
        }
        return conv
      })
    )

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({conversationId: targetId, message: text})
    })
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

    <div className="max-w-2xl mx-auto">

      <h1 className="text-2xl font-bold text-center mb-4">Lily's chatbot</h1>

      <Drawer direction="left">
        <DrawerTrigger asChild>
          <Button variant="outline">Conversations</Button>
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
                {conv.title || conv.id.slice(0, 8) + "..."}
              </Button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      <ScrollArea className="h-150 w-full rounded-md border p-4">
        <div className="flex flex-col">
          {messages.map((msg, index) => ( 
              <Card key={index} className={msg.role === "user" ? "self-end": "self-start"}>
                <CardContent>
                    <p>{msg.content}</p>
                </CardContent>
              </Card>
          ))}
        </div>
      </ScrollArea>

      <Textarea
        id="box"
        name="box"
        value={text}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>)=>setText(event.target.value)}
      />
      <div className="flex-col items-center justify-center">
        <Button onClick={()=>handleSend()}>Send</Button>
      </div>

    </div>
  )
}

export default App;

import "./App.css";
import { useState, useEffect } from "react";
import {type Message, type Conversation} from "../server/storage.js"

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
  const [conversationId, setConversationId] = useState<string | null >(null)
  const [conversationList, setConversationList] = useState<Conversation[]>([])

  useEffect(() => {
    handleNewConversation()
  }, [])

  function handleNewConversation(){
    fetch('/conversations', { method: 'POST'})
      .then(response => (
        console.log('response:', response),
        response.json()
      ))
      .then(data => (
        console.log('data:', data),
        setConversationList([...conversationList, data]),
        setConversationId(data.id)
      ))
      .catch(error => console.error('Error:', error))
  }

  function handleSend(){
    // setConversation(prev => [...prev, {role: 'user', content: text}]) - old, from when we only had a single chat
    setConversationList(prev =>                                                                                                                                                                        
      prev.map(conv => {                                                                                                                                                                             
        if (conv.id === conversationId) {                                                                                                                                                              
          return { ...conv, messages: [...conv.messages, { role: 'user', content: text }] }                                                                                                            
        }
        return conv
      })
    )

    fetch( '/chat',
      { method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({conversationId: conversationId, message: text})
      })
      .then(response => (
        // console.log('response',response),
        response.json())
      )
      .then(data => {
        console.log('data handleSend',data);
        const role = data.role;
        console.log('role handleSend', role);
        const content = data.content[0].text;
        console.log('content handleSend',content)
        const newMessage = {role, content};
        console.log('newMessage handleSend', newMessage);
        setConversationList(prev => 
          prev.map( conv => {
            if (conv.id === conversationId) {
              return {...conv, messages: [...conv.messages, newMessage]}
            } 
            return conv
          }) 
        )
        // setConversation(prev => [...prev, newMessage]) - old, from when we only had a single chat
      })
      .catch(error => console.error('Error:', error))
    setText("")
  }

  const currentConversation = conversationList.find(conv => conv.id === conversationId)
  const messages = currentConversation?.messages ?? []

  return (
    <div className="max-w-2xl mx-auto">

      <Drawer direction="left">
        <DrawerTrigger asChild>
          <Button variant="outline">Conversations</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Conversations</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-2 p-4">
            <Button onClick={() => handleNewConversation()}>New Conversation</Button>
            {conversationList.map(conv => (
              <Button
                key={conv.id}
                variant={conv.id === conversationId ? "default" : "outline"}
                onClick={() => setConversationId(conv.id)}
                className="justify-start text-left truncate"
              >
                {conv.title || conv.id.slice(0, 8) + "..."}
              </Button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      <h1>Lily's chatbot</h1>

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

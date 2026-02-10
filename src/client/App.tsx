import "./App.css";
import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function App() {
  const [text, setText] = useState("")
  const [conversation, setConversation] = useState<{role: string, content: string}[]>([])

  function handleSend(){
    setConversation(prev => [...prev, {role: 'user', content: text}])
    fetch( '/chat',
      { method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({message: text})
      })
      .then(response => (
        // console.log('response',response),
        response.json())
      )
      .then(data => {
        console.log('data',data);
        const role = data.role;
        console.log('role:', role);
        const content = data.content[0].text;
        console.log('content:',content)
        const newMessage = {role, content};
        console.log('newMessage:', newMessage)
        setConversation(prev => [...prev, newMessage])
      })
      .catch(error => console.error('Error:', error))
  }

  return (
    <>
      <h1>Lily's chatbot</h1>
      <label id="box">
          Send a message:
        </label>
      <br></br>
      <Textarea
        id="box"
        name="box"
        value={text}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>)=>setText(event.target.value)}
      />

      <br></br>

      <div className="flex min-h-svh flex-col items-center justify-center">
        <Button onClick={()=>handleSend()}>Send</Button>
      </div>

      <div className="flex flex-col">
         {conversation.map((msg, index) => ( 
            <Card key={index} className={msg.role === "user" ? "self-end": "self-start"}>
              <CardContent>
                  <p>{msg.content}</p>
              </CardContent>
            </Card>
        ))}
      </div>

      {/* <div>
        {
          conversation.map((msg, index) => ( 
            <p key={index}>{msg.content}</p>
          )
        )}
      </div> */}


    </>
  )
}

export default App;

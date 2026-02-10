import "./App.css";
import { useState } from "react";

function App() {
  const [text, setText] = useState("")
  const [conversation, setConversation] = useState<{role: string, content: string}[]>([])

  function handleSend(){
    fetch( '/chat',
      { method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({message: text})
      })
      .then(response => (
        console.log('response',response),
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
        setConversation([...conversation, newMessage])
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
      <textarea
        id="box"
        name="box"
        value={text}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>)=>setText(event.target.value)}
      />
      <br></br>
      <button onClick={()=>handleSend()}>Send</button>
      <div>
        {
          conversation.map(msg => 
            <p>{msg.content}</p>
          )
        }
      </div>
    </>
  )
}

export default App;

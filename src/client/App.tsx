import "./App.css";
import { useState } from "react";

function App() {
  const [text, setText] = useState("")
  const [conversation, setConversation] = useState([])

  function handleSend(){
    fetch( '/chat',{ method: 'POST'})
      .then(response => response.json())
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
      <div></div>
    </>
  )
}

export default App;

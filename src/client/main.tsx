import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router";

import App from "./App";
import Login from "./Login";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <BrowserRouter>
        {/* <Link to="/">home</Link>
        <Link to="/chat/:conversationId">chats</Link>
        <Link to="/new">new</Link> */}
        <Routes>
            <Route path="/" element = { <Login />} />
            <Route path="/chat/:chatId" element = { <App />} />
            <Route path="/new" element = { <App />} />
        </Routes>
    </BrowserRouter>
);

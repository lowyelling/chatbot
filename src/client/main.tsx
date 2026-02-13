import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { authClient } from "../lib/auth-client"

import App from "./App";
import Login from "./Login";

export function ProtectedRoute({ children }: {children: React.ReactNode}){
    const session = authClient.useSession()
    if (session.data) return children
    else if (session.isPending) return null 
    return <Navigate to="/"></Navigate>
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element = { <Login />} />
            <Route path="/chat/:chatId" element = { <ProtectedRoute><App /></ProtectedRoute>} />
            <Route path="/new" element = { <ProtectedRoute><App /></ProtectedRoute>} />
        </Routes>
    </BrowserRouter>
);



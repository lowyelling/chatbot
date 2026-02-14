import "./App.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { authClient } from "../lib/auth-client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function Login(){
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isSignUp, setIsSignUp] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const session = authClient.useSession()
    const data = session.data

    useEffect(() => {
        if (data) navigate("/new")
    }, [data])

    async function signIn(){
        await authClient.signIn.email({
            email,
            password
        }, {
            onSuccess: () => navigate("/new"),
            onError: (ctx) => setError(ctx.error.message)
        })
    }

    async function signUp(){
        await authClient.signUp.email({
            email,
            password,
            name: email
        }, {
            onSuccess: () => navigate("/new"),
            onError: (ctx) => setError(ctx.error.message)
        })
    }

    async function signWithGitHub(){
        await authClient.signIn.social({
            provider: "github",
            callbackURL: "/new"
        })
    }

    function handleSubmit(event: React.SyntheticEvent){
        event.preventDefault()
        isSignUp ? signUp() : signIn()
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <Card className="w-full max-w-sm">
                <CardContent className="py-2">
                    <h1 className="text-3xl font-bold text-center">❤️ Lily's Chatbot 🤖</h1>
                </CardContent>
            </Card>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">
                        {isSignUp ? "Sign Up" : "Sign In"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <Input type="email" placeholder="Email" value={email} autoComplete="email" onChange={(event) => setEmail(event.target.value)} />
                        <Input type="password" placeholder="Password" value={password} autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full">{isSignUp ? "Sign Up" : "Sign In"}</Button>
                    </form>

                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-muted-foreground text-sm">or</span>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    <Button variant="outline" className="w-full" onClick={() => signWithGitHub()}>
                        {isSignUp ? "Sign Up" : "Sign In"} with GitHub
                    </Button>

                    <button
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsSignUp(prev => !prev)}
                    >
                        {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                    </button>
                </CardContent>
            </Card>
        </div>
    )
}

export default Login
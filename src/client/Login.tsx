import "./App.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { authClient } from "../lib/auth-client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function Login(){
    const navigate = useNavigate()
    // state for email, password, and whether user is signing up or signing in (boolean like isSignUp)
    // use useNavigate for redirecting after success

    const [email, setEmail] = useState("") // to wire up Input as controlled input
    const [password, setPassword] = useState("") // to wire up Input as controlled input
    const [isSignUp, setIsSignUp] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // check if already logged in
    const session = authClient.useSession() 
    console.log('session:', session)
    const data = session.data
    console.log('data.session:', data)

    // useEffect(() => {
    //     if (session) navigate("/new")
    // }, [session])

    async function signIn(){
        await authClient.signIn.email({
            email, // user email address
            password // user password -> min 8 characters as default
        }, {
            onSuccess: () => navigate("/new"),
            onError: (ctx) => setError(ctx.error.message) //ctx = context, an Object passed to callback with ctx.error.message or .status etc
        })
    }

    async function signUp(){
        await authClient.signUp.email({
            email, // user email address
            password, // user password -> min 8 characters as default
            name: email
        }, {
            onSuccess: () => navigate("/new"),
            onError: (ctx)=>setError(ctx.error.message)
        }         
        )
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
        <>
        <h1 className="text-3xl font-bold text-center mb-4">Lily's chatbot</h1>

        {isSignUp ? 

            (
                <div>
                    <h1 className="text-2xl font-bold text-center mb-4">Sign Up</h1>
                    <form onSubmit={handleSubmit}>
                        <Input type="email" placeholder="Email" value={email} autoComplete="email" onChange={(event)=>setEmail(event.target.value)}/>
                        <Input type="password" placeholder="Password" value={password} autoComplete="current-password" onChange={(event)=>setPassword(event.target.value)}/>
                        {error && <p className="text-red-500">{error}</p>}    
                        <Button type="submit">Sign Up</Button>
                    </form>
                </div>
            )

        :
        
            (
                <div>
                    <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
                    <form onSubmit={handleSubmit}>
                        <Input type="email" placeholder="Email" value={email} autoComplete="email" onChange={(event)=>setEmail(event.target.value)}/>
                        <Input type="password" placeholder="Password" value={password} autoComplete="current-password" onChange={(event)=>setPassword(event.target.value)}/>
                        {error && <p className="text-red-500">{error}</p>}    
                        <Button type="submit">Login</Button>
                    </form>
                </div>
            )
        }

        <Button onClick={()=>signWithGitHub()}>{isSignUp ? "Sign Up" : "Sign In"} with Github</Button>
        <button onClick={()=> setIsSignUp(prev=>!prev)}>
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
        </button>
        </>

    )
}

export default Login
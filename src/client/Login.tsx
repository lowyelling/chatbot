import "./App.css";
import { useState, useEffect } from "react";
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
    const [isSignUp, setIsSignUp] = useState(true)
    const [error, setError] = useState<string | null>(null)

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
            password // user password -> min 8 characters as default
            // name
        }, {
            onSuccess: () => navigate("/new"),
            onError: (ctx)=>setError(ctx.error.message)
        }         
        )
    }

    async function signWithGitHub(){
        await authClient.signIn.social({ provider: "github", callbackURL: "/new"},{
            onSuccess: () => navigate("/new"),
            onError: (ctx) => setError(ctx.error.message)
        })
    }


    return (
        <>
        {isSignUp ? (
        <div>
            <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
            <Input type="email" placeholder="Email" value={email} onChange={(event)=>setEmail(event.target.value)}/>
            <Input type="password" placeholder="Password" value={password} onChange={(event)=>setPassword(event.target.value)}/>
            <Button onClick={()=>signIn()}>Login</Button>
            <Button onClick={()=>signWithGitHub()}>Sign-in with Github</Button>
        </div>)
        :

        (
        <div>
            <h1 className="text-2xl font-bold text-center mb-4">Sign Up</h1>
            <Input type="email" placeholder="Email" value={email} onChange={(event)=>setEmail(event.target.value)}/>
            <Input type="password" placeholder="Password" value={password} onChange={(event)=>setPassword(event.target.value)}/>
            <Button onClick={()=>signUp()}>Sign Up</Button>
            <Button onClick={()=>signWithGitHub()}>Sign up with Github</Button>
        </div>)
        }

        <button onClick={()=> setIsSignUp(prev=>!prev)}>
            {isSignUp ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
        </>

    )
}

export default Login
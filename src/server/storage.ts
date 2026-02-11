import { randomUUID } from "crypto"

export type Message = {
  role: 'user' | 'assistant';
  content: string
}


export type Conversation = {
    id: string
    title: string
    createdAt: Date
    messages: Message[]
}


export interface Storage {
    // each method needs: name, parameters (inputs), and return type (output)
    createConversation(): Conversation
    getConversation(conversationId: string): Conversation | null
    getConversations(): Conversation[]
    addMessagetoConversation(conversationId: string, message: Message): void 
}

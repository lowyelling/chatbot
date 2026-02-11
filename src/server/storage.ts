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
    addMessagetoConversation(conversationId: string, message: Message): void // function doesn't return anything, it produces side effect
}


class inMemoryStorage implements Storage {

    conversations = new Map<string, Conversation>()
    // no const or let inside a class property - while inside a method, can still use const/let for local variables
    // overcomplicating it with new Map<string, ReturnType<typeof createConversation>>() because I already have a Conversation type defined. 

    createConversation(){
        let id = randomUUID()
        const conversation: Conversation = {
            id: id,
            title: "",
            createdAt: new Date(), // need new Date() to create value of actual timestamp. Not just Date, which is the class/constructor
            messages: []
        }
        this.conversations.set(id, conversation)
        return conversation
    }

    getConversation(conversationId: string){
        // error handling - eg ID not exist - throw error? return null? return Result object? 
        let conversation = this.conversations.get(conversationId)
        if (!conversation){
            console.warn("conversation doesn't exist")
            return null
        } else return conversation
    }

    getConversations(){
        let iterator = this.conversations.values()
        let conversationArray = Array.from(iterator)
        return conversationArray
    }   

    addMessagetoConversation(conversationId: string, message: Message){
        let conversation = this.conversations.get(conversationId)
        if (!conversation){
           console.warn("conversation doesn't exist")
        } else conversation.messages.push(message) // no need for conversation?
    }
}

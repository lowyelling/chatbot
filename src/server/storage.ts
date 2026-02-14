import { randomUUID } from "crypto"

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}


export type Conversation = {
    id: string
    userId: string
    title: string
    createdAt: Date
    messages: Message[]
}


export interface Storage {
    // each method needs: name, parameters (inputs), and return type (output)
    createConversation(userId: string): Conversation
    getConversation(conversationId: string, userId: string): Conversation | null
    getConversations(userId: string): Conversation[]
    addMessagetoConversation(conversationId: string, userId: string, message: Message): void // function doesn't return anything, it produces side effect
    updateConversationTitle(conversationId: string, userId: string, title: string): void
}


export class inMemoryStorage implements Storage {

    conversations = new Map<string, Conversation>()
    // no const or let inside a class property - while inside a method, can still use const/let for local variables
    // overcomplicating it with new Map<string, ReturnType<typeof createConversation>>() because I already have a Conversation type defined. 

    createConversation(userId: string){
        let id = randomUUID()
        const conversation: Conversation = {
            id: id,
            userId: userId,
            title: "",
            createdAt: new Date(), // need new Date() to create value of actual timestamp. Not just Date, which is the class/constructor
            messages: []
        }
        this.conversations.set(id, conversation)
        return conversation
    }

    getConversation(conversationId: string, userId: string){
        // error handling - eg ID not exist - throw error? return null? return Result object?
        let conversation = this.conversations.get(conversationId)
        if (!conversation || conversation.userId !== userId){
            console.warn("conversation doesn't exist")
            return null
        } else return conversation
    }

    getConversations(userId: string){
        let iterator = this.conversations.values()
        let conversationArray = Array.from(iterator).filter(conv => conv.userId === userId)
        return conversationArray
    }

    addMessagetoConversation(conversationId: string, userId: string, message: Message){
        let conversation = this.conversations.get(conversationId)
        if (!conversation || conversation.userId !== userId){
           throw new Error("conversation doesn't exist")
        } else conversation.messages.push(message) // no need for conversation?. optional chaining
    }

    updateConversationTitle(conversationId: string, userId: string, title: string){
        let conversation = this.conversations.get(conversationId)
        if (!conversation || conversation.userId !== userId){
           throw new Error("conversation doesn't exist")
        }
        conversation.title = title
    }
}

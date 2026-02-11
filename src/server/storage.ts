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
            return null
        } else return conversation
    }


//       // position parameter validation 
//   if (!Number.isInteger(position)) {
//     throw new Error("Position must be an integer")
//   }

    // getConversations(){

    // }

    // addMessagetoConversation(){

    // }

}

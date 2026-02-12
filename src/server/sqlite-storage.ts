import Database from 'better-sqlite3';

import { randomUUID } from "crypto"
import { type Message, type Conversation, Storage } from "./storage"

// REFERENCE ONLY
// export type Message = {
//   role: 'user' | 'assistant';
//   content: string
// }

// export type Conversation = {
//     id: string
//     title: string
//     createdAt: Date
//     messages: Message[]
// }

export class SQliteStorage implements Storage {
    db: InstanceType <typeof Database>

      constructor() {
          this.db = new Database('foobar.db')
          this.db.pragma('journal_mode = WAL')
          this.db.exec(`CREATE TABLE IF NOT EXISTS conversations(
            id TEXT PRIMARY KEY, 
            title TEXT NOT NULL,
            createdAt TEXT NOT NULL)`
          )
          this.db.exec(`CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                conversationId TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                createdAt TEXT NOT NULL,
                FOREIGN KEY (conversationId) REFERENCES conversations(id)
            )`)
      }

    createConversation() {
        let id = randomUUID()
        let createdAt = new Date().toISOString() // SQLite lacks real datetime type - store ISO strings and they sort correctly due to ISO being alphabetical (thus chronological)

        this.db.prepare( // compiles SQL statement for execution 
            `INSERT INTO conversations (id, title, createdAt) VALUES (?, ?, ?)` // ? are placeholders, filled in by the arguments in .run(). Parameterized query to prevent SQL injection
        ).run(id, "", createdAt) // executes the SQL statement. Used for INSERT/UPDATE/DELETE (statements that change the data, not returning rows)

        // note no messages column, since they live in their own table. Empty conversation means "no rows in messages with this conversationId"
 
        return {
            id,
            title: "",
            createdAt: new Date(createdAt),
            messages: []
        }
    }

    getConversation(conversationId: string){

    }

    getConversations(){

    }

    addMessagetoConversation(conversationId: string, message: Message){

    }
  }
    

export class inMemoryStorage implements Storage {

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
        } else conversation.messages.push(message) // no need for conversation?. optional chaining
    }
}

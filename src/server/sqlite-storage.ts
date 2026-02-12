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

    getConversation(conversationId: string) {
        // Step 1: get the conversation row
        const row = this.db.prepare(
            `SELECT id, title, createdAt FROM conversations WHERE id = ?`
        ).get(conversationId) as { id: string, title: string, createdAt: string } | undefined 
        // .get() returns one row (or undefined if no match). Compare to .run() which returns no data.

        if (!row) return null

        // Step 2: get all messages for this conversation, ordered by time
        const messageRows = this.db.prepare(
            `SELECT role, content FROM messages WHERE conversationId = ? ORDER BY createdAt`
        ).all(conversationId) as Message[]
        // .all() returns an array of rows. Third method for query execution: .run() for writes, .get() for one row, .all() for many rows.

        // my instinct was to start with Conversations and left join Messages on Conversations.id = Messages.Conversationsid, but Claude suggested to break it up for easier reading
        // first get conversation, then get its messages - perf is negligible

        return {
            id: row.id,
            title: row.title,
            createdAt: new Date(row.createdAt),
            messages: messageRows
        }
    }

    getConversations() {
        // Get all conversations
        const rows = this.db.prepare(
            `SELECT id, title, createdAt FROM conversations ORDER BY createdAt`
        ).all() as { id: string, title: string, createdAt: string }[]

        // For each conversation, fetch its messages
        // This is N+1 apparently - with a prod app, I'd want to optimize this
        return rows.map(row => {
            const messages = this.db.prepare(
                `SELECT role, content FROM messages WHERE conversationId = ? ORDER BY createdAt`
            ).all(row.id) as Message[]

            return {
                id: row.id,
                title: row.title,
                createdAt: new Date(row.createdAt),
                messages
            }
        })
    }

    addMessagetoConversation(conversationId: string, message: Message) {
        // Same pattern as createConversation — INSERT + .run()
        this.db.prepare(
            `INSERT INTO messages (id, conversationId, role, content, createdAt) VALUES (?, ?, ?, ?, ?)`
        ).run(randomUUID(), conversationId, message.role, message.content, new Date().toISOString())
    }
}

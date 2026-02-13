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

      constructor(filename: string) {
          this.db = new Database(filename) // ':memory:' instead of 'foobar.db' so that tests create a throwaway in-memory db that vanishes with each instance
          this.db.pragma('journal_mode = WAL')
          this.db.exec(`CREATE TABLE IF NOT EXISTS conversations(
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
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

    createConversation(userId: string) {
        let id = randomUUID()
        let createdAt = new Date().toISOString()

        this.db.prepare(
            `INSERT INTO conversations (id, userId, title, createdAt) VALUES (?, ?, ?, ?)`
        ).run(id, userId, "", createdAt)

        return {
            id,
            userId,
            title: "",
            createdAt: new Date(createdAt),
            messages: []
        }
    }

    getConversation(conversationId: string, userId: string) {
        const row = this.db.prepare(
            `SELECT id, userId, title, createdAt FROM conversations WHERE id = ? AND userId = ?`
        ).get(conversationId, userId) as { id: string, userId: string, title: string, createdAt: string } | undefined

        if (!row) return null

        const messageRows = this.db.prepare(
            `SELECT role, content FROM messages WHERE conversationId = ? ORDER BY createdAt`
        ).all(conversationId) as Message[]

        return {
            id: row.id,
            userId: row.userId,
            title: row.title,
            createdAt: new Date(row.createdAt),
            messages: messageRows
        }
    }

    getConversations(userId: string) {
        const rows = this.db.prepare(
            `SELECT id, userId, title, createdAt FROM conversations WHERE userId = ? ORDER BY createdAt`
        ).all(userId) as { id: string, userId: string, title: string, createdAt: string }[]

        return rows.map(row => {
            const messages = this.db.prepare(
                `SELECT role, content FROM messages WHERE conversationId = ? ORDER BY createdAt`
            ).all(row.id) as Message[]

            return {
                id: row.id,
                userId: row.userId,
                title: row.title,
                createdAt: new Date(row.createdAt),
                messages
            }
        })
    }

    addMessagetoConversation(conversationId: string, userId: string, message: Message) {
        // Verify the conversation belongs to this user before inserting
        const row = this.db.prepare(
            `SELECT id FROM conversations WHERE id = ? AND userId = ?`
        ).get(conversationId, userId)

        if (!row) throw new Error("conversation doesn't exist")

        this.db.prepare(
            `INSERT INTO messages (id, conversationId, role, content, createdAt) VALUES (?, ?, ?, ?, ?)`
        ).run(randomUUID(), conversationId, message.role, message.content, new Date().toISOString())
    }
}

import { describe, it, expect } from "vitest" 
import {type Message, type Conversation, Storage, inMemoryStorage} from "./storage"

// ---------------------------------------------------------------------------
// createConversation
// ---------------------------------------------------------------------------
describe("createConversation", () => {

    it("returns conversation with ID, title, createdAt, and empty messages array", () => {
        const storage = new inMemoryStorage()
        const conversation = storage.createConversation()
        expect(conversation.id).toBeTruthy()
        expect(typeof conversation.id).toBe("string")
        expect(conversation.title).toBe("")
        expect(conversation.createdAt).toBeInstanceOf(Date)
        expect(conversation.messages).toEqual([])
    })

    it("returns different IDs with different conversations", () => {
        const storage = new inMemoryStorage()
        const conversation1 = storage.createConversation()
        const conversation2 = storage.createConversation() 
        expect(conversation1.id).not.toBe(conversation2.id)
    })
})

// ---------------------------------------------------------------------------
// getConversation
// ---------------------------------------------------------------------------
describe("getConversation", () => {

    it("returns a conversation that has been created", () => {
        const storage = new inMemoryStorage()
        const conversation = storage.createConversation()
        const id = conversation.id 
        const returned = storage.getConversation(id)
        expect(returned).toEqual(conversation)

    })

    it("returns null when ID doesn't exist", () => {
        const storage = new inMemoryStorage()
        const returned = storage.getConversation("sksdf93")
        expect(returned).toBe(null)
    })
})

// ---------------------------------------------------------------------------
// getConversations
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// addMessagetoConversation
// ---------------------------------------------------------------------------


// describe("createGame", () => {
//   it("returns an empty board", () => {
//     const game = createGame();
//     expect(game.board).toEqual([null, null, null, null, null, null, null, null, null]);
//   });

//   it("starts with X as the current player", () => {
//     const game = createGame();
//     expect(game.currentPlayer).toBe("X");
//   });
// });
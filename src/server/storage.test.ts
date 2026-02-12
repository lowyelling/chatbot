import { describe, it, expect } from "vitest" 
import { type Message, type Conversation, Storage, inMemoryStorage } from "./storage"
import { SQliteStorage } from "./sqlite-storage"

function makeStorage(){
    // return new inMemoryStorage() 
    return new SQliteStorage()
}

// ---------------------------------------------------------------------------
// createConversation
// ---------------------------------------------------------------------------
describe("createConversation", () => {

    it("returns conversation with ID, title, createdAt, and empty messages array", () => {
        const storage = makeStorage()
        const conversation = storage.createConversation()
        expect(conversation.id).toBeTruthy()
        expect(typeof conversation.id).toBe("string")
        expect(conversation.title).toBe("")
        expect(conversation.createdAt).toBeInstanceOf(Date)
        expect(conversation.messages).toEqual([])
    })

    it("returns different IDs with different conversations", () => {
        const storage = makeStorage()
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
        const storage = makeStorage()
        const conversation = storage.createConversation()
        const id = conversation.id 
        const returned = storage.getConversation(id)
        expect(returned).toEqual(conversation)

    })

    it("returns null when ID doesn't exist", () => {
        const storage = makeStorage()
        const returned = storage.getConversation("sksdf93")
        expect(returned).toBe(null)
    })
})

// ---------------------------------------------------------------------------
// getConversations
// ---------------------------------------------------------------------------
describe("getConversations", () => {

    it("returns an empty array when there are no conversations", () => {
        const storage = makeStorage()
        const returned = storage.getConversations()
        expect(returned).toEqual([])
    })

    it("returns all conversations", () => {
        const storage = makeStorage()
        const chat1 = storage.createConversation()
        const chat2 = storage.createConversation()
        const chat3 = storage.createConversation()
        const returned = storage.getConversations()
        expect(returned.length).toEqual(3)
        expect(returned).toContainEqual(chat1)
        expect(returned).toContainEqual(chat2)
        expect(returned).toContainEqual(chat3)
        // expect(returned[0]).toEqual(chat1) // Map happens work due to preservation of insertion order, but a database might return them in different order
        // expect(returned[1]).toEqual(chat2)
        // expect(returned[2]).toEqual(chat3)
    })
})

// ---------------------------------------------------------------------------
// addMessagetoConversation
// ---------------------------------------------------------------------------

describe("addMessagetoConversation", () => {
    it("actually shows the last message", () => {
        const storage = makeStorage()
        const conversation = storage.createConversation()
        const msg: Message = {role: 'user', content: 'hello'}
        storage.addMessagetoConversation(conversation.id, msg) // remember added is undefined/void!! const added = is meaningless
        const updated = storage.getConversation(conversation.id)
        expect(updated?.messages).toContainEqual({role: 'user', content: 'hello'})
    })

    it("returns nothing when ID doesn't exist", () => {
        const storage = makeStorage()
        const msg: Message = {role: 'user', content: 'hey hey'}
        storage.addMessagetoConversation("akd93", msg)
        expect(storage.getConversations()).toEqual([])
    })
})


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
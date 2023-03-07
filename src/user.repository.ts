import { Database } from "./db.js";
import { Personality } from "./openai.js";

export type Message = {
    text: string;
    user_id: number;
    role: "user" | "assistant";
    usage: number;
    timestamp: number;
    personality: Personality;
}

export class User {
    id: number;
    username?: string;
    balance: number;
    messages: Message[];
    selectedPersonality: Personality;

    constructor(id: number, username?: string) {
        this.id = id;
        this.username = username;
        this.balance = 100000;
        this.messages = [];
        this.selectedPersonality = "assistant";
    }

   
}



export class UserRepository {
    db: Database;
    users: User[] = [];
    constructor() {
        this.db = new Database("./db.json");
        this.users = this.db.get("users");

    }

    saveData()  {
        this.db.set("users", this.users);
    }
    getUser(id: number) {
        return this.users.find((user) => user.id === id);
    }
    addUser(user: User) {
        this.users.push(user);
        this.saveData();
        return user;
    }

    setBalance(userId: number, newBalance: number) {
        const user = this.getUser(userId)!!;
        user.balance = newBalance;
        this.saveData();
    }

    addMessagesToHistory(userId: number, promptMessage: Message, responseMessage: Message) {
        const user = this.getUser(userId)!!;
        user.messages.push(promptMessage, responseMessage);
        this.saveData();
    }
}
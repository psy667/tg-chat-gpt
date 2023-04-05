import { TelegramBot, TgBot } from "./telegrambot.js";
import * as dotenv from "dotenv";
import { OpenAI } from "./openai.js";
import { Message, User, UserRepository } from "./user.repository.js";

const {BOT_TOKEN, OPENAI_TOKEN} = dotenv.config().parsed!!;

const tg = new TelegramBot(BOT_TOKEN);

const openai = new OpenAI(OPENAI_TOKEN);

const userRepository = new UserRepository();

tg.tg.command("topup", async (ctx) => {
    if(ctx.message.from.username !== "psy667") {
        return "Тебе такое нельзя";
    }

    const [cmd, username, amountStr] = ctx.message.text.split(" ");
    const amount = parseInt(amountStr);

    const user = userRepository.users.find(item => item.username === username);
    if(!user) {
        ctx.reply("Пользователь не найден");

        return ""
    }
    // console.log({cmd,username, user, amount});

    user!!.balance += amount;
    userRepository.saveData();

    await tg.tg.telegram.sendMessage(user!!.id, `Ваш баланс пополнен на ${amount} токенов. Теперь у вас ${user!!.balance} токенов`);
    ctx.reply(`Баланс ${username} пополнен на ${amount} токенов. Теперь у него ${user!!.balance} токенов`);
});
tg.onCommand("balance", (ctx) => {
    const user = userRepository.getOrCreateUser(ctx.message.from.id, ctx.message.from.username);
    return `Ваш баланс: ${user.balance}`
});

tg.onCommand("toxic", (ctx) => {
    const user = userRepository.getOrCreateUser(ctx.message.from.id, ctx.message.from.username);
    user.selectedPersonality = "toxic";
    user.messages = [];
    return "Теперь вы общаетесь с токсичным ботом. Контекст диалога обнулен. Внимание! Бот может быть неадекватным и нецензурным.";
});

tg.onCommand("assistant", (ctx) => {
    const user = userRepository.getOrCreateUser(ctx.message.from.id, ctx.message.from.username);
    user.selectedPersonality = "assistant";
    user.messages = [];
    return "Теперь вы общаетесь с помощником. Контекст диалога обнулен.";
});

tg.onCommand("translator", (ctx) => {
    const user = userRepository.getOrCreateUser(ctx.message.from.id, ctx.message.from.username);
    user.selectedPersonality = "translator";
    user.messages = [];
    return "Теперь вы общаетесь с переводчиком.";
});

tg.onCommand("dnd", (ctx) => {
    const user = userRepository.getOrCreateUser(ctx.message.from.id, ctx.message.from.username);
    user.selectedPersonality = "dnd";
    user.messages = [];
    return "Теперь вы общаетесь с ботом для игры в ДнД. Контекст диалога обнулен.";
});

tg.onCommand("therapist", (ctx) => {
    const user = userRepository.getOrCreateUser(ctx.message.from.id, ctx.message.from.username);
    user.selectedPersonality = "therapist";
    user.messages = [];
    return "Теперь вы общаетесь с ботом-психотерапевтом. Контекст диалога обнулен.";
});

tg.onCommand("reset", (ctx) => {
    const user = userRepository.getOrCreateUser(ctx.message.from.id, ctx.message.from.username);
    user.messages = [];
    return "Контекст диалога обнулен";
});

tg.onCommand("pay", (ctx) => {
    return "Чтобы пополнить баланс напишите мне в лс @psy667, указав сумму пополнения. Цена 100,000 токенов - 50 рублей. 1 токен - символ";
});

tg.onCommand("help", (ctx) => {
    return "По всем вопросам можете обращаться ко мне в личные сообщения @psy667"
});

tg.onMessage(async (msg) => {
    const {text, user_id, username} = msg;
    // const isRussian = new RegExp(/.*[а-яА-ЯёЁ]{1}.*/).test(text);

    let user = await userRepository.getOrCreateUser(user_id, username);

    if(!user) {
        user = userRepository.addUser(new User(user_id, username));
    }

    if(text.length > 5000) {
        return "Слишком длинное сообщение";
    }

    if(user.balance < 0) {
        return "У вас закончились токены. Пополните баланс";
    }
    const currentTimestamp = Date.now();
    const hourAgo = currentTimestamp - 1000 * 60 * 60;

    const lastMessages = user.messages.slice(-7).filter(it => it.timestamp > hourAgo).map((msg) => ({role: msg.role, content: msg.text}));

    console.log("CREATING ANSWER")
    const {response, usage} = await openai.createAnswer(user.selectedPersonality, lastMessages, msg.text);
    console.log("ANSWER CREATED");
    
    const promptMessage: Message = {
        text,
        user_id,
        role: "user",
        usage: usage.prompt_tokens,
        timestamp: Date.now(),
        personality: user.selectedPersonality,
    }

    const responseMessage: Message = {
        text: response,
        user_id,
        role: "assistant",
        usage: usage.completion_tokens,
        timestamp: Date.now(),
        personality: user.selectedPersonality,
    };

    userRepository.setBalance(user.id, user.balance - usage.total_tokens);
    
    userRepository.addMessagesToHistory(user.id, promptMessage, responseMessage);
    console.log({promptMessage, responseMessage})
    return response;
})

import { Telegraf } from "telegraf";

export namespace TgBot {
    export type Message = {
        text: string;
        user_id: number;
        username?: string;
    };
}

export class TelegramBot {
    public tg;

    
    constructor(token: string) {
        this.tg = new Telegraf(token);
        this.tg.launch();
    }

    onCommand(command: string, callback: (ctx: any) => string) {
        this.tg.command(command, (ctx) => {
            ctx.reply(callback(ctx));
        });
    }

    onMessage(callback: (msg: TgBot.Message) => Promise<string>) {
        this.tg.on('message', (ctx) => {
            ctx.sendChatAction("typing");
            // @ts-ignore
            if(!ctx.message.text) return;


            const msg = {
                // @ts-ignore
                text: ctx.message.text,
                user_id: ctx.message.from.id,
                username: ctx.message.from.username,
            }
            try {
                const reply = callback(msg);
            
                if(typeof reply === "string") {
                    ctx.reply(reply);
                } else if(reply instanceof Promise) {
                    reply.then((reply) => {
                        ctx.reply(reply);
                    })
                }
            } catch(e) {
                console.log({error: e})
            }
            
        });
    };
}
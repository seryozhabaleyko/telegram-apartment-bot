import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';

@Injectable()
export class AppService {
    private readonly bot: Telegraf<Context>;

    constructor(private readonly configService: ConfigService) {
        this.bot = new Telegraf<Context>(
            this.configService.get('TELEGRAM_BOT_TOKEN'),
        );

        this.bot.on(message('text'), async (ctx) => {
            await ctx.reply(`Здарова заебал!`);
        });

        this.bot.launch();
    }

    getHello(): string {
        return 'Hello World!';
    }
}

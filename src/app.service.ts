import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import { chromium } from 'playwright';
import { JsonDB, Config } from 'node-json-db';

interface Article {
    title: string;
    date: string;
}

const db = new JsonDB(new Config('db', true, false, '/'));

@Injectable()
export class AppService {
    private readonly bot: Telegraf<Context>;

    constructor(private readonly configService: ConfigService) {
        this.bot = new Telegraf<Context>(
            this.configService.get('TELEGRAM_BOT_TOKEN'),
        );

        this.bot.command('start', (ctx) => {
            (async () => {
                const browser = await chromium.launch({
                    headless: true,
                });

                const context = await browser.newContext();
                const page = await context.newPage();
                await page.goto('https://web.dev/blog');
                const articles = await page.$$('article');

                for (const article of articles) {
                    const item: Article = {
                        title: await article.$eval(
                            'h2 > a',
                            (el) => el.textContent,
                        ),
                        date: await article.$eval(
                            'time',
                            (el) => el.textContent,
                        ),
                    };

                    db.push('/articles[]', item);
                }

                await browser.close();
            })();

            return ctx.reply('completed');
        });

        this.bot.launch();
    }

    getHello(): string {
        return 'Hello World!';
    }
}

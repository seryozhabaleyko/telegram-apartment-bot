import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import { chromium } from 'playwright';
import { JsonDB, Config } from 'node-json-db';

@Injectable()
export class AppService {
    private readonly bot: Telegraf<Context>;

    constructor(private readonly configService: ConfigService) {
        this.bot = new Telegraf<Context>(
            this.configService.get('TELEGRAM_BOT_TOKEN'),
        );

        const db = new JsonDB(new Config('db', true, false, '/'));

        this.bot.command('start', (ctx) => {
            (async () => {
                const browser = await chromium.launch({
                    headless: true,
                });

                const context = await browser.newContext();
                const page = await context.newPage();
                await page.goto(this.configService.get('URL'));
                const elements = await page.$$(
                    '.list-simple__output li.announcement-container',
                );

                const apartments: string[] = [];

                for (const element of elements) {
                    const href = await element.$eval(
                        'a.announcement-block__title',
                        (el) => el.getAttribute('href'),
                    );

                    if (!href) {
                        return;
                    }

                    apartments.push(href);

                    // ctx.reply(`https://www.bazaraki.com${href}`);
                }

                db.push('/apartments', apartments);

                await browser.close();

                //return ctx.reply('completed.end');
            })();
        });

        this.bot.launch();
    }

    getHello(): string {
        return 'Hello World!';
    }
}

import 'dotenv/config'
import {BotKeyboard, Dispatcher, filters, html, NodeTelegramClient} from '@mtcute/node'

const client = new NodeTelegramClient({
    apiId: parseInt(process.env.API_ID!),
    apiHash: process.env.API_HASH!,
    storage: 'bot-data/session',
})

const dp = new Dispatcher(client)

dp.onChatMemberUpdate(
    filters.and(
        filters.not(filters.chatMemberSelf),
        filters.chatMember('joined')
    ),
    async (upd) => {
        await client.kickChatMember(upd.chat.inputPeer, upd.user.inputPeer)
    }
)

dp.onChatMemberUpdate(
    filters.and(filters.chatMemberSelf, filters.chatMember('joined')),
    async (upd) => {
        const me = await client.getChatMember(upd.chat.inputPeer, 'self')
        if (!me.permissions?.banUsers) {
            await client.leaveChat(upd.chat.inputPeer)
        }
    }
)

dp.onNewMessage(filters.start, async (msg) => {
    await msg.answerText(
        html`
            <b>Hello!</b>
            <br/><br/>
            I am a bot that will help keep your channels free of subscribers.
            <br/><br/>
            <i>Why would you want that?</i> Well, there are cases when you want
            a channel to just be a place with information/archive, and don't
            want random people to subscribe to it.
            <br/><br/>
            Source code: <a href="//github.com/teidesu/anti-sub-bot">GitHub</a>
            Powered by <a href="//github.com/mtcute/mtcute">MTCute</a>
        `,
        {
            replyMarkup: BotKeyboard.inline([
                [
                    BotKeyboard.url(
                        'Add me to a channel',
                        `https://t.me/${client.getMyUsername()!}?startgroup=start&admin=restrict_members`
                    ),
                ],
            ]),
            disableWebPreview: true,
        }
    )
})

client.run(
    {
        botToken: process.env.BOT_TOKEN!,
    },
    (user) => {
        console.log('Logged in as', user.username)
    }
)

import { Dispatcher, filters } from '@mtcute/dispatcher'
import { BotKeyboard, html, TelegramClient } from '@mtcute/node'

const client = new TelegramClient({
  apiId: Number.parseInt(process.env.API_ID!),
  apiHash: process.env.API_HASH!,
  storage: 'bot-data/session',
})

const dp = Dispatcher.for(client)

dp.onChatMemberUpdate(
  filters.and(
    filters.not(filters.chatMemberSelf),
    filters.chatMember('joined'),
  ),
  async (upd) => {
    await client.kickChatMember({ chatId: upd.chat.inputPeer, userId: upd.user.inputPeer })
  },
)

dp.onChatMemberUpdate(
  filters.and(filters.chatMemberSelf, filters.chatMember('joined')),
  async (upd) => {
    const me = await client.getChatMember({ chatId: upd.chat.inputPeer, userId: 'self' })
    if (!me?.permissions?.banUsers) {
      await client.leaveChat(upd.chat.inputPeer)
    }
  },
)

dp.onNewMessage(filters.start, async (msg) => {
  await msg.answerText(
    html`
            <b>hello!</b>
            <br/><br/>
            i am a bot that will help keep your channels free of subscribers.
            <br/><br/>
            <i>why would you want that?</i> well, there are cases when you want
            a channel to just be a place with information/archive, and don't
            want random people to subscribe to it.
            <br/><br/>
            source code: <a href="//github.com/teidesu/anti-sub-bot">GitHub</a>
            powered by <a href="//github.com/mtcute/mtcute">mtcute</a>
        `,
    {
      replyMarkup: BotKeyboard.inline([
        [
          BotKeyboard.url(
            'Add me to a channel',
            `https://t.me/${await client.getMyUsername()!}?startgroup=start&admin=restrict_members`,
          ),
        ],
      ]),
      disableWebPreview: true,
    },
  )
})

client.run(
  {
    botToken: process.env.BOT_TOKEN!,
  },
  (user) => {
    console.log('Logged in as', user.username)
  },
)

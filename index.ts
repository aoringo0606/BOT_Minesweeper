import { Api, Client } from 'traq-bot-ts';

const api = new Api({
  baseApiParams: { headers: { Authorization: `Bearer ${process.env.TOKEN}` } },
});
const client = new Client({ token: process.env.TOKEN });

client.on('MESSAGE_CREATED', async ({ body }) => {
  const {
    user: { name },
    plainText,
    channelId,
    createdAt,
  } = body.message;
  if (!plainText.includes('easy')) return;

  const message = `!!:zero:!!!!:one:!!!!:two:!!!!:two:!!!!:one:!!!!:one:!!!!:bomb:!!!!:two:!!!!:bomb:!!\n!!:zero:!!!!:one:!!!!:bomb:!!!!:bomb:!!!!:one:!!!!:one:!!!!:one:!!!!:two:!!!!:one:!!\n!!:zero:!!!!:one:!!!!:two:!!!!:two:!!!!:two:!!!!:two:!!!!:two:!!!!:one:!!!!:zero:!!\n!!:zero:!!!!:zero:!!!!:zero:!!!!:zero:!!!!:one:!!!!:bomb:!!!!:bomb:!!!!:one:!!!!:zero:!!\n!!:zero:!!!!:zero:!!!!:zero:!!!!:zero:!!!!:one:!!!!:two:!!!!:three:!!!!:two:!!!!:one:!!\n!!:one:!!!!:one:!!!!:zero:!!!!:zero:!!!!:zero:!!!!:zero:!!!!:one:!!!!:bomb:!!!!:one:!!\n!!:bomb:!!!!:one:!!!!:zero:!!!!:zero:!!!!:one:!!!!:one:!!!!:two:!!!!:one:!!!!:one:!!\n!!:one:!!!!:one:!!!!:zero:!!!!:one:!!!!:two:!!!!:bomb:!!!!:one:!!!!:zero:!!!!:zero:!!\n!!:zero:!!!!:zero:!!!!:zero:!!!!:one:!!!!:bomb:!!!!:two:!!!!:one:!!!!:zero:!!!!:zero:!!`;

  console.log(`Sending message: ${message}`);

  await api.channels.postMessage(channelId, { content: message, embed: true });
});

client.listen(() => {
  console.log('Listening...');
});
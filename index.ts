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
    let message: string = "";
    //マインスイーパーを生成するコード
    //easy  : 9x9, 10 mines
    //normal: 16x16, 40mines
    //hard  : 30x16, 99mines
    if (!plainText.includes('easy') && !plainText.includes('normal') && !plainText.includes('hard')) return;
    const width = plainText.includes('easy') ? 9 : plainText.includes('normal') ? 16 : 30;
    const height = plainText.includes('easy') ? 9 : plainText.includes('normal') ? 16 : 16;
    const minesCount = plainText.includes('easy') ? 10 : plainText.includes('normal') ? 40 : 99;
    const stamps = new Map<number,string>([
        [0, '!!:zero:!!'],
        [1, '!!:one:!!'],
        [2, '!!:two:!!'],
        [3, '!!:three:!!'],
        [4, '!!:four:!!'],
        [5, '!!:five:!!'],
        [6, '!!:six:!!'],
        [7, '!!:seven:!!'],
        [8, '!!:eight:!!'],
        [-1, '!!:bomb:!!'],
    ])
    //フィールドの初期化
    const field: number[][] = Array.from({ length: width }, () =>
    Array.from({ length: height }, () => 0)
    );
    //地雷の配置
    let minesPlaced = 0;
    while(minesPlaced < minesCount){
        const x: number = Math.floor(Math.random() * width);
        const y: number = Math.floor(Math.random() * height);
        if(!field[x]) continue;
        if(x >= 0 && x < width && y >= 0 && y < height && field[x][y] !== -1){
            field[x][y] = -1;
            minesPlaced++;
        }
    }
    //数字の配置
    for(let x: number = 0; x < width; x++){
        for(let y: number = 0; y < height; y++){
            if(!field[x]) continue;
            if(field[x][y] === -1) continue;
            let count: number = 0;
            for(let dx: number = -1; dx <= 1; dx++){
                for(let dy: number = -1; dy <= 1; dy++){
                    const nx: number = x + dx;
                    const ny: number = y + dy;
                    if(!field[x]) continue;
                    if(nx >= 0 && nx < width && ny >= 0 && ny < height && field[nx][ny] === -1){
                        count++;
                    }
                }
            }
            field[x][y] = count;
        }
    }

    // メッセージの生成
    for(let y: number = 0; y < height; y++){
        for(let x: number = 0; x < width; x++){
            if(!field[x]) continue;
            message += stamps.get(field[x][y]) || '!!:question:!!';
        }
        message += '\n';
    }

    await api.channels.postMessage(channelId, { content: message, embed: true });
});

client.listen(() => {
  console.log('Listening...');
});
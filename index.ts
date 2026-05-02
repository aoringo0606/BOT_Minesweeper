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
    //extreme: 9x9, 67mines
    if (!plainText.includes('easy') && !plainText.includes('normal') && !plainText.includes('hard') && !plainText.includes('extreme')){
        message = "how to use:\n`@BOT_Minesweeper mode[easy/normal/hard/extreme]`\ndifficulty:\n```txt\neasy:\t9x9,\t10 mines\nnormal:\t16x16,\t40 mines\nhard:\t30x16,\t99mines\nextreme:9x9,\t67mines(14 safe cells)\n```";
        await api.channels.postMessage(channelId, { content: message, embed: true });
        return;
    }
    const width = plainText.includes('easy') ? 9 : plainText.includes('normal') ? 16 : plainText.includes('extreme') ? 9 : 30;
    const height = plainText.includes('easy') ? 9 : plainText.includes('normal') ? 16 : plainText.includes('extreme') ? 9 : 16;
    const minesCount = plainText.includes('easy') ? 10 : plainText.includes('normal') ? 40 : plainText.includes('extreme') ? 67 : 99;
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
        [9, ':zero:'],
        [10, ':one:'],
        [11, ':two:'],
        [12, ':three:'],
        [13, ':four:'],
        [14, ':five:'],
        [15, ':six:'],
        [16, ':seven:'],
        [17, ':eight:'],
        [-1, '[!!:bomb:!!](//ansaikuropedia.org/wiki/%E9%A6%AC%E9%B9%BF)'],
    ])
    const stamps_large = new Map<number,string>([
        [0, '!!:zero.ex-large:!!'],
        [1, '!!:one.ex-large:!!'],
        [2, '!!:two.ex-large:!!'],
        [3, '!!:three.ex-large:!!'],
        [4, '!!:four.ex-large:!!'],
        [5, '!!:five.ex-large:!!'],
        [6, '!!:six.ex-large:!!'],
        [7, '!!:seven.ex-large:!!'],
        [8, '!!:eight.ex-large:!!'],
        [9, ':zero.ex-large:'],
        [10, ':one.ex-large:'],
        [11, ':two.ex-large:'],
        [12, ':three.ex-large:'],
        [13, ':four.ex-large:'],
        [14, ':five.ex-large:'],
        [15, ':six.ex-large:'],
        [16, ':seven.ex-large:'],
        [17, ':eight.ex-large:'],
        [-1, '[!!:bomb.ex-large:!!](//ansaikuropedia.org/wiki/%E9%A6%AC%E9%B9%BF)'],
    ])
    //フィールドの初期化
    const field: number[][] = Array.from({ length: width }, () =>
    Array.from({ length: height }, () => 0)
    );
    if(plainText.includes('extreme')) {
        for(let dx: number = -1; dx <= 1; dx++){
            for(let dy: number = -1; dy <= 1; dy++){
                const nx: number = 4 + dx;
                const ny: number = 4 + dy;
                if(!field[nx]) continue;
                if(nx >= 0 && nx < width && ny >= 0 && ny < height){
                    field[nx][ny] = -2; // -2は安全地帯
                }
            }
        }
        //安全地帯の配置
        let safePlaced = 0;
        while(safePlaced < 5){
            const x: number = Math.floor(Math.random() * width);
            const y: number = Math.floor(Math.random() * height);
            if(!field[x]) continue;
            if(x >= 0 && x < width && y >= 0 && y < height && field[x][y] === 0){
                field[x][y] = -2;
                safePlaced++;
            }
        }
        //地雷の配置
        for (let x: number = 0; x < width; x++){
            for (let y: number = 0; y < height; y++){
                if(!field[x]) continue;
                if(field[x][y] === -2) continue;
                field[x][y] = -1;
            }
        }    
    }else{
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

    //ヒントをオープン
    if(plainText.includes('extreme')) {
        for(let dx: number = -1; dx <= 1; dx++){
            for(let dy: number = -1; dy <= 1; dy++){
                const nx: number = 4 + dx;
                const ny: number = 4 + dy;
                if(!field[nx]) continue;
                if(nx >= 0 && nx < width && ny >= 0 && ny < height){
                    field[nx][ny] = field[nx][ny] + 9;
                }
            }
        }
    }else{
        //ランダムな0を1つオープン
        //もし0がなかったら何もしない
        let flag = false;
        for(let x: number = 0; x < width; x++){
            for(let y: number = 0; y < height; y++){
                if(!field[x]) continue;
                if(field[x][y] === 0){
                    flag = true;
                    break;
                }
            }
        }
        if(flag){
            let zeroPlaced = 0;
            while(zeroPlaced < 1){
                const x: number = Math.floor(Math.random() * width);
                const y: number = Math.floor(Math.random() * height);
                if(!field[x]) continue;
                if(x >= 0 && x < width && y >= 0 && y < height && field[x][y] === 0){
                    field[x][y] = field[x][y] + 9;
                    zeroPlaced++;
                }
            }
        }
    }

    // メッセージの生成
    if(!plainText.includes('large')){
        for(let y: number = 0; y < height; y++){
            for(let x: number = 0; x < width; x++){
                if(!field[x]) continue;
                message += stamps.get(field[x][y]) || '!!:question:!!';
            }
            message += '\n';
        }
    }else{
        for(let y: number = 0; y < height; y++){
            for(let x: number = 0; x < width; x++){
                if(!field[x]) continue;
                message += stamps_large.get(field[x][y]) || '!!:question:!!';
            }
            message += '\n';
        }
    }

    await api.channels.postMessage(channelId, { content: message, embed: true });
});

client.listen(() => {
  console.log('Listening...');
});
import axios from 'axios';
import fs from 'fs';

const timer = ms => new Promise(res => setTimeout(res, ms))

const getData = async () => {
    // `wallets-list.json` is the file where you have a list of addresses to check for humanity
    fs.readFile('./wallets-list.json', 'utf-8', async (err, data) => {
        let json = JSON.parse(data);

        // If you want to analyze a particular set of data, slice it here
        json = json.slice(150, 3000); // <-- SLICE YOUR SAMPLE HERE

        const fsp = fs.promises;

        // This loop checks if a wallet has logged in to OpenSea or not
        // If a wallet has logged in to OpenSea it is less likely that it is a bot
        for(let i = 0; i < json.length; i++) {
            try {
                const resp = await axios.get(`https://api.opensea.io/user/${json[i].walletAddress}`);
                console.log(`${json[i].walletAddress}, VALID`);
                await fsp.appendFile(
                  './checked-wallets.csv', `\r\n${json[i].walletAddress}, VALID`
                );
            } catch (e) {
                console.log(`${json[i].walletAddress}, INVALID`);
                await fsp.appendFile(
                  './checked-wallets.csv', `\r\n${json[i].walletAddress}, INVALID`
                );
                if (e.response.status !== 404) {
                    await timer(10000);
                    i--;
                    continue;
                }
            }
            await timer(1000);
            if (i % 6 === 3) {
                await timer(1000);
            }
        }
    });
};

getData();
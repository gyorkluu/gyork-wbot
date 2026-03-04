const WindowsBot = require('./index.js');

async function main() {
    const a = await WindowsBot.create('127.0.0.1', 19999);
    await a.sleep(10000);
    a.close();
}

main();
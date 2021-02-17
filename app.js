

const { NFC } = require('nfc-pcsc');
 
const nfc = new NFC(); // optionally you can pass logger
nfc.on('reader', reader => {
reader.on('card', async card => {
 
    console.log();
    console.log(`card detected`, card);

    try {
 
        const data = Buffer.allocUnsafe(12);
        data.fill(0);
        const text = (new Date()).toTimeString();
        data.write(text); // if text is longer than 12 bytes, it will be cut off
        // reader.write(blockNumber, data, blockSize = 4)
        await reader.write(4, data); // starts writing in block 4, continues to 5 and 6 in order to write 12 bytes
        console.log(`data written`);
 
    } catch (err) {
        console.error(`error when writing data`, err);
    }
 
});
}
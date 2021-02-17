"use strict";
const {NFC}   = require('nfc-pcsc');

const nfc = new NFC();
//const nfc = new NFC(pretty); // optionally you can pass logger to see internal debug logs

nfc.on('reader', async reader => {

//	pretty.info(`device attached`, reader);
   console.log(`device attached`, reader.name)
	reader.on('card', async card => {
             
		// MIFARE Classic is ISO/IEC 14443-3 tag
		// skip other standards
      
		if (card.type !== 'TAG_ISO_14443_3') {
			return;
		}
        console.log(`card detected`, reader.name, card)
		//pretty.info(`card detected`, reader, card);

		// Reading and writing data from/to MIFARE Classic cards (e.g. MIFARE 1K) ALWAYS requires authentication!

		// How does the MIFARE Classic authentication work?
		// 1. You authenticate to a specific sector using a specific key (key + keyType).
		// 2. After the successful authentication, you are granted permissions according to the access conditions
		//    for the given key (access conditions are specified in the trailer section of each sector).
		//    Depending on the access conditions, you can read from / write to the blocks of this sector.
		// 3. If you want to access data in another sectors, you have to authenticate to that sector.
		//    Then you can access the data from the block within that sector (only from that sector).
		// summary: MIFARE Classic will only grant permissions based on the last authentication attempt.
		//          Consequently, if multiple reader.authenticate(...) commands are used,
		//          only the last one has an effect on all subsequent read/write operations.

		// reader.authenticate(blockNumber, keyType, key, obsolete = false)
		// - blockNumber - the number of any block withing the sector we want to authenticate
		// - keyType - type of key - either KEY_TYPE_A or KEY_TYPE_B
		// - key - 6 bytes - a Buffer instance, an array of bytes, or 12-chars HEX string
		// - obsolete - (default - false for PC/SC V2.07) use true for PC/SC V2.01
const KEY_TYPE_A=            0x60;
        const keyType = KEY_TYPE_A;

		// Don't forget to fill YOUR keys and types! (default ones are stated below)
		const key = 'FFFFFFFFFFFF'; // key must be a 12-chars HEX string, an instance of Buffer, or array of bytes
		
        
		try {

            console.log(key);
            console.log(keyType);
			// we want to authenticate sector 1
			// authenticating one block within the sector will authenticate all blocks within that sector
			// so in our case, we choose block 4 that is within the sector 1, all blocks (4, 5, 6, 7)
			// will be authenticated with the given key
			await reader.authenticate(4,KEY_TYPE_A,key);

			// Note: writing might require to authenticate with a different key (based on the sector access conditions)
            console.log(`sector 1 successfully authenticated`, reader)
			//pretty.info(`sector 1 successfully authenticated`, reader);

		} catch (err) {
            //console.log(key);
			console.log(`error when authenticating block 4 within the sector 1`, reader, err)
            //pretty.error(`error when authenticating block 4 within the sector 1`, reader, err);
			return;
		}

/* 
		// example reading 16 bytes (one block) assuming containing 32bit integer
		// !!! note that we don't need 16 bytes - 32bit integer takes only 4 bytes !!!
		try {

			// reader.read(blockNumber, length, blockSize = 4, packetSize = 16)
			// - blockNumber - memory block number where to start reading
			// - length - how many bytes to read
			// - blockSize - 4 for MIFARE Ultralight, 16 for MIFARE Classic
			// ! Caution! length must be divisible by blockSize
			// ! Caution! MIFARE Classic cards have sector trailers
			//   containing access bits instead of data, each last block in sector is sector trailer
			//   (e.g. block 3, 7, 11, 14)
			//   see memory structure above or https://github.com/pokusew/nfc-pcsc/issues/16#issuecomment-304989178

			const data = await reader.read(4, 16, 16); // blockSize=16 must specified for MIFARE Classic cards

			pretty.info(`data read`, reader, data);

			const payload = data.readInt32BE(0);

			pretty.info(`data converted`, reader, payload);

		} catch (err) {
			pretty.error(`error when reading data`, reader, err);
		}
 */
/* 
		// example write 16 bytes containing 32bit integer
		// !!! note that we don't need 16 bytes - 32bit integer takes just 4 bytes !!!
		try {

			// reader.write(blockNumber, data, blockSize = 4, packetSize = 16)
			// - blockNumber - memory block number where to start writing
			// - data - what to write
			// - blockSize - 4 for MIFARE Ultralight, 16 for MIFARE Classic
			// ! Caution! data.length must be divisible by blockSize
			// ! Caution! MIFARE Classic cards have sector trailers
			//   containing access bits instead of data, each last block in sector is sector trailer
			//   (e.g. block 3, 7, 11, 14)
			//   ee memory structure above or https://github.com/pokusew/nfc-pcsc/issues/16#issuecomment-304989178

			const data = Buffer.allocUnsafe(16);
			data.fill(0);
			const randomNumber = Math.round(Math.random() * 1000);
			data.writeInt32BE(randomNumber, 0);

			await reader.write(4, data, 16); // blockSize=16 must specified for MIFARE Classic cards

			pretty.info(`data written`, reader, randomNumber, data);

		} catch (err) {
			pretty.error(`error when writing data`, reader, err);
		}

 */
	});

	reader.on('error', err => {
		pretty.error(`an error occurred`, reader, err);
	});

	reader.on('end', () => {
		pretty.info(`device removed`, reader);
	});


});

nfc.on('error', err => {
	pretty.error(`an error occurred`, err);
});

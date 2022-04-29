export default {
	writeVarInt: (n: number, byteConsumer: (n: number) => void) => {
		do {
			let temp = n & 0b01111111;
			n >>>= 7;
			if (n != 0) {
				temp |= 0b10000000;
			}
			byteConsumer(temp);
		} while (n != 0);
	},

	getVarIntSize: (n: number) => {
		let size = 0;
		do {
			n >>>= 7;
			size++;
		} while (n != 0);
		return size;
	},

	readVarInt: (byteProvider: () => number) => {
		let numRead = 0;
		let result = 0;
		let read;
	
		do {
			read = byteProvider();
			const value = read & 0b01111111;
			result |= value << (7 * numRead);
	
			numRead++;
			if (numRead > 5) {
				throw new Error('VarInt is too big');
			}
		} while ((read & 0b10000000) != 0);
	
		return result;
	}
}
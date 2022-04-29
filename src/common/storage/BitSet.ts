export default class BitSet {
	words: bigint[];

	constructor(nbits: number) {
		this.words = [];

		let longs = Math.ceil(nbits / 64) 

		while (longs-- > 0) {
			this.words.push(0n);
		}
	}

	public set(index: number, val: boolean) {
		const w = this.wordIndex(index);
		const b = this.bitIndex(index);

		if (w >= this.words.length) {
			let x = w - this.words.length;

			while (x-- >= 0) {
				this.words.push(0n);
			}
		}

		if (val) {
			this.words[w] |= BigInt(0x1 << b);
		} else {
			this.words[w] ^= BigInt(0x1 << b);
		}
	}

	public get(index: number) {
		const w = this.wordIndex(index);
		const b = this.bitIndex(index);

		if (w >= this.words.length) {
			return false;
		}

		return ((this.words[w] >> BigInt(b)) & 0x1n) == 1n;
	}

	private wordIndex(index: number) {
		return Math.floor(index / 64);
	}

	private bitIndex(index: number) {
		return Math.floor(index % 64);
	}
}

import { Position } from "../util/Types.ts";
import Uuids from "../util/Uuids.ts";

const textDecoder = new TextDecoder();


export default class PacketReader {
	buffer: Uint8Array;
	view: DataView;
	pos: number;

	constructor(buffer: Uint8Array) {
		this.buffer = buffer;
		this.view = new DataView(buffer.buffer);
		this.pos = 0;
	}

	readBool(): boolean {
		const x = this.buffer[this.pos] == 0x01;
		this.pos += 1;
		return x;
	}

	readByte(): number {
		const x = this.view.getInt8(this.pos);
		this.pos += 1;
		return x;
	}

	readUByte(): number {
		const x = this.buffer[this.pos];
		this.pos += 1;
		return x;
	}

	readShort(): number {
		const x = this.view.getInt16(this.pos);
		this.pos += 2;
		return x;
	}

	readUShort(): number {
		const x = this.view.getUint16(this.pos);
		this.pos += 2;
		return x;
	}

	readInt(): number {
		const x = this.view.getInt32(this.pos);
		this.pos += 4;
		return x;
	}

	readLong(): bigint {
		const x = this.view.getBigInt64(this.pos);
		this.pos += 8;
		return x;
	}

	readFloat(): number {
		const x = this.view.getFloat32(this.pos);
		this.pos += 4;
		return x;
	}

	readDouble(): number {
		const x = this.view.getFloat64(this.pos);
		this.pos += 8;
		return x;
	}

	readString(): string {
		const x = this.readVarInt();
		const a = this.readByteArray(x);
		return textDecoder.decode(a);
	}

	readUUID(): string {
		return Uuids.bytesToString(this.readByteArray(Uuids.byteSize));
	}

	readPosition(): Position {
		const val = this.readLong();
		return [Number(val >> 38n), Number(val & 0xffn), Number((val >> 12n) & 0x3ffffffn)];
	}

	readVarInt(): number {
		let numRead = 0;
		let result = 0;
		let read;

		do {
			read = this.readByte();
			const value = read & 0b01111111;
			result |= value << (7 * numRead);

			numRead++;
			if (numRead > 5) {
				throw new Error('VarInt is too big');
			}
		} while ((read & 0b10000000) != 0);

		return result;
	}

	readVarLong(): bigint {
		let numRead = 0n;
		let result = 0n;
		let read;
		do {
			read = BigInt(this.readByte());
			const value = read & 0b01111111n;
			result |= value << (7n * numRead);

			numRead++;
			if (numRead > 10) {
				throw new Error('VarLong is too big');
			}
		} while ((read & 0b10000000n) != 0n);

		return result;
	}

	readByteArray(n: number): Uint8Array {
		const x = this.buffer.slice(this.pos, this.pos + n);
		this.pos += n;
		return x;
	}

	readLongArray(): bigint[] {
		const array = [];
		let length = this.readVarInt();
		while (length-- > 0) {
			array.push(this.readLong());
		}

		return array;
	}

	readIntArray(): number[] {
		const array = [];
		let length = this.readVarInt();
		while (length-- > 0) {
			array.push(this.readInt());
		}

		return array;
	}

	atEnd() {
		return this.pos >= this.buffer.length;
	}
}

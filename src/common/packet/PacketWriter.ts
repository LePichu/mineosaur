import VarInts from '../util/VarInts.ts';

import * as nbt from '../nbt/index.ts'
import { Position } from "../util/Types.ts";
import Uuids from "../util/Uuids.ts";
import { zlib } from "../deps.ts";

const textEncoder = new TextEncoder();

export default class PacketWriter {
	buffer: Uint8Array;
	view: DataView;
	pos: number;

	constructor(lenght: number = 4096) {
		this.buffer = new Uint8Array(lenght);
		this.view = new DataView(this.buffer.buffer);
		this.pos = 0;
	}

	protected doubleSizeIfNeeded(n: number) {
		if (n + this.pos >= this.buffer.length) {
			const old = this.buffer;
			this.buffer = new Uint8Array(this.buffer.length * 2);
			this.buffer.set(old);
			this.view = new DataView(this.buffer.buffer);
		}
	}

	writeBool(n: boolean) {
		this.doubleSizeIfNeeded(1);
		this.buffer[this.pos] = n ? 0x01 : 0x00;
		this.pos += 1;
		return this;
	}

	writeByte(n: number) {
		this.doubleSizeIfNeeded(1);

		this.view.setInt8(this.pos, n);
		this.pos += 1;
		return this;
	}

	writeUByte(n: number) {
		this.doubleSizeIfNeeded(1);

		this.buffer[this.pos] = n;
		this.pos += 1;
		return this;
	}

	writeShort(n: number) {
		this.doubleSizeIfNeeded(2);

		this.view.setInt16(this.pos, n);
		this.pos += 2;
		return this;
	}

	writeUShort(n: number) {
		this.doubleSizeIfNeeded(2);

		this.view.setUint16(this.pos, n);
		this.pos += 2;
		return this;
	}

	writeInt(n: number) {
		this.doubleSizeIfNeeded(4);

		this.view.setInt32(this.pos, n);
		this.pos += 4;
		return this;
	}

	writeUInt(n: number) {
		this.doubleSizeIfNeeded(4);

		this.view.setUint32(this.pos, n);
		this.pos += 4;
		return this;
	}

	writeLong(n: bigint) {
		this.doubleSizeIfNeeded(8);

		this.view.setBigInt64(this.pos, n);
		this.pos += 8;
		return this;
	}

	writeFloat(n: number) {
		this.doubleSizeIfNeeded(4);

		this.view.setFloat32(this.pos, n);
		this.pos += 4;
		return this;
	}

	writeDouble(n: number) {
		this.doubleSizeIfNeeded(8);

		this.view.setFloat64(this.pos, n);
		this.pos += 8;
		return this;
	}

	writeString(n: string) {
		const a = textEncoder.encode(n);
		this.doubleSizeIfNeeded(a.length + 1);

		this.writeVarInt(a.length);
		this.writeByteArray(a);
		return this;
	}

	writeIdentifier(channel: string) {
		// Todo: add validation
		this.writeString(channel);
		return this;
	}

	writeNbt(nbtData: nbt.TagObject) {
		this.writeByteArray(nbt.encode('', nbtData));
		return this;
	}

	writeUUID(uuid: string) {
		this.writeByteArray(Uuids.stringToBytes(uuid));
		return this;
	}

	writePosition(pos: Position) {
		const x = BigInt(pos[0]);
		const y = BigInt(pos[1]);
		const z = BigInt(pos[2]);

		this.writeLong(((x & 0x3ffffffn) << 38n) | ((z & 0x3ffffffn) << 12n) | (y & 0xfffn));
		return this;
	}

	writeVarInt(n: number) {
		this.doubleSizeIfNeeded(5);

		do {
			let temp = n & 0b01111111;
			n >>>= 7;
			if (n != 0) {
				temp |= 0b10000000;
			}
			this.writeByte(temp);
		} while (n != 0);

		return this;
	}

	writeVarLong(n: bigint) {
		this.doubleSizeIfNeeded(10);

		do {
			let temp = n & 0b01111111n;
			n >>= 7n;
			if (n != 0n) {
				temp |= 0b10000000n;
			}
			this.writeByte(Number(temp));
		} while (n != 0n);

		return this;
	}

	writeByteArray(n: Uint8Array) {
		this.doubleSizeIfNeeded(n.length);

		for (let x = 0; x < n.length; x++) {
			this.buffer[this.pos + x] = n[x];
		}
		this.pos += n.length;
		return this;
	}

	writeLongArray(n: bigint[] | BigInt64Array) {
		const lenght = n.length;
		this.writeVarInt(lenght);
		for (let i = 0; i < lenght; i++) {
			this.writeLong(n[i]);
		}
	}

	writeIntArray(n: number[] | Uint32Array | Int32Array) {
		const lenght = n.length;
		this.writeVarInt(lenght);
		for (let i = 0; i < lenght; i++) {
			this.writeInt(n[i]);
		}
	}

	toPacket(compressed = false): Uint8Array {
		const tempArray = this.buffer.slice(0, this.pos);

		if (compressed) {
			const compressed = zlib.deflate(tempArray);

			const out = new Uint8Array(compressed.length + VarInts.getVarIntSize(tempArray.length));

			let pos = 0;

			VarInts.writeVarInt(compressed.length + VarInts.getVarIntSize(tempArray.length), (b) => (out[pos++] = b));
			VarInts.writeVarInt(tempArray.length, (b) => (out[pos++] = b));

			out.set(compressed, pos);

			return out;
		} else {
			const out = new Uint8Array(this.pos + VarInts.getVarIntSize(this.pos));

			let pos = 0;

			VarInts.writeVarInt(this.pos, (b) => (out[pos++] = b));
			out.set(tempArray, pos);
			return out;
		}
	}
}

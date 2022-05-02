import BlockPos from "./BlockPos.ts"
import ChunkPos from "./ChunkPos.ts"

export default class Chunk {
    private data: Uint32Array
    private min: number
    private max: number
    private height: number
    readonly pos: ChunkPos

    constructor(min: number, max: number, pos: ChunkPos) {
        this.pos = pos
        this.min = min
        this.max = max
        this.height = Math.abs(min)+Math.abs(max)
        this.data = new Uint32Array(16*16*this.height)
    }

    getBlock(pos: BlockPos): number|undefined {
        if (pos.y < this.min) return;
        if (pos.y >= this.max) return;
        const y = pos.y - this.min
        const x = pos.x % 16
        const z = pos.z % 16
        return this.data[x + z*16 + y*16*this.height]
    }
}
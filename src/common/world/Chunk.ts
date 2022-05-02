export default class Chunk {
    private data: Uint32Array
    private min: number
    private max: number
    private height: number
    readonly x: number
    readonly z: number

    constructor(min: number, max: number, x: number, z: number) {
        this.x = x;
        this.z = z;
        this.min = min
        this.max = max
        this.height = Math.abs(min)+Math.abs(max)
        this.data = new Uint32Array(16*16*this.height)
    }

    getBlock(x: number, y: number, z: number): number|undefined {
        if (y < this.min) return;
        if (y >= this.max) return;
        const ny = y - this.min
        const nx = x % 16
        const nz = z % 16
        return this.data[nx + nz*16 + ny*16*this.height]
    }
}
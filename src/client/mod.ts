//import { zlib } from "../common/deps.ts"
import Chunk from "../common/world/Chunk.ts"
import ChunkPos from "../common/world/ChunkPos.ts"
import BlockPos from "../common/world/BlockPos.ts"
//import * as three from "https://unpkg.com/three@0.140.0/build/three.module.js"

const chunk = new Chunk(-64,320,new ChunkPos(0,0))
console.log(chunk.getBlock(new BlockPos(1,1,1)))
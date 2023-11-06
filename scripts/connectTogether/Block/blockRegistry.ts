import { world } from "@minecraft/server";
import { ConnectBlock } from "./connectBlock";



export const BlockRegistry:Map<string, ConnectBlock>=new Map<string,ConnectBlock>();


export function RegisterBlock(typeId:string, blockBehavior:ConnectBlock) {
    BlockRegistry.set(typeId, blockBehavior);
    world.afterEvents.playerPlaceBlock.subscribe(blockBehavior.callPlacementEvent.bind(blockBehavior), {blockTypes:[blockBehavior.typeId]});
    world.afterEvents.playerBreakBlock.subscribe(blockBehavior.callBreakEvent.bind(blockBehavior), {blockTypes:[blockBehavior.typeId]});
    
}



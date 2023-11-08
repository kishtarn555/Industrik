import ItemPipeComponent from "../itemPipeSystem/itemPipeComponent";
import { ItemPusher } from "./ItemPusher.block";
import { ItemPacket } from "../itemPipeSystem/itemPacket";
import { Block, BlockInventoryComponent, Direction } from "@minecraft/server";
import { getDirectionFromState,  getNeighborFromDirection, getOpositeDirection } from "../library/BlockAPI/BlockApi.extension";
import { PipeBlock, addConnectorBlock } from "./pipeBlock.connectBlock";
import { CableBlock } from "./Cable";
import { getItemPipeComponent } from "../itemPipeSystem/componentRegisrty";

const ItemPusherIPC = new ItemPipeComponent(
    {
        block: ItemPusher,
        onPacketReceive:onPipeBlockReceive
    }
);


function onPipeBlockReceive(packet:ItemPacket) :boolean {
    const context = packet.context;
    const block = context.dimension.getBlock(context.location);
    if (block==null) {
        packet.reject("Item pusher is unloaded");
        return true;
    }
    const target = getNeighborFromDirection(block, context.direction);
    if (target==null) {
        packet.reject("Cannot push items to unloaded or out of bounds blocks");
        return true;
    }

    const targetContainer = (target.getComponent(BlockInventoryComponent.componentId) as (BlockInventoryComponent | undefined))?.container;
    if (targetContainer==null) {
        packet.reject("Cannot push items to non container block");
        return true;
    }
    if (packet.data.Container!= null) {
        const sourceContainer = packet.data.Container;
        
        if (!sourceContainer.isValid()) {
            packet.reject("Container became invalid during transmission");
            return true;
        }
        let movedItem=false;
        for (let slot =0; slot < sourceContainer.size; slot++) {
            let item = sourceContainer.getItem(slot);
            if (item == null) continue;
            let before = item.amount
            let after = sourceContainer.transferItem(slot, targetContainer)?.amount;
            movedItem=true;
            if (before !== after) break;
            movedItem=false;
        }
        if (!movedItem) {
            packet.reject("No tranfer, either target is full or source is empty");
            return true;
        }
        packet.resolve("success");
        return true;
        
    }
    packet.reject("Other types of item sources are not implemented yet")

    return true;
}

function SendItemFromItemPusher(block:Block) {
    const facing_state = block.permutation.getState("minecraft:facing_direction") as "up" | "down" | "north" | "south" | "east" | "west"
    const direction = getDirectionFromState(facing_state);
    const fromBlock = getNeighborFromDirection(block, direction)
    
    
    const fromInventory: BlockInventoryComponent | undefined = fromBlock?.getComponent(BlockInventoryComponent.componentId) as BlockInventoryComponent | undefined
    const fromContainer = fromInventory?.container;
    if (fromContainer == null) {
        return;
    }
    const sendDirection = getOpositeDirection(direction);
    const toBlock = getNeighborFromDirection(block, sendDirection);
    if (toBlock==null) {
        return;
    }
    

    const component = getItemPipeComponent(toBlock.typeId);
    if (component==null) {
        return;
    }
    new Promise<any>((resolve,reject)=>{
        const packet = new ItemPacket(
            {
                Container:fromContainer
            },
            {
                dimension:toBlock.dimension,
                location:toBlock.location,
                distance:0,
                direction:sendDirection
            },
            resolve,
            reject
        );
        if (!component.onPacketReceive(packet)) {
            reject("Component did not accept item package");
        }
    })
    .then(_=>{})
    .catch(_=>{});
}


addConnectorBlock(ItemPusher.typeId);
ItemPusher.subscribeNeighborToBlockUpdates(PipeBlock);




export { ItemPusherIPC, SendItemFromItemPusher }




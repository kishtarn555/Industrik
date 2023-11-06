import { Block, BlockInventoryComponent, ItemStack, world } from "@minecraft/server";
import { ConnectBlock, CustomBlockEventArgs } from "../../connectTogether/Block/connectBlock";
import { CableBlock, addConnectorBlock as appendCableConnector } from "./Cable";
import { PipeBlock, addConnectorBlock as appendPipeConnector } from "./ItemPipe";
import { PowerBlockMachine, PowerOnEventId, RegisterMachineBlock } from "../power/powerSystem";

const ItemPusherId="industrik:item_pusher";
const ItemPusher = new ConnectBlock(
    {
        identifier: ItemPusherId,

    }
)

const ItemPusherMachine = new PowerBlockMachine({
    block:ItemPusher
});

RegisterMachineBlock(ItemPusherId, ItemPusherMachine);

ItemPusher.subscribeBlockToNeighborUpdates(PipeBlock);
ItemPusher.subscribeBlockToNeighborUpdates(CableBlock);


//FIXME This should be its own method
appendCableConnector(ItemPusher.typeId);
appendPipeConnector(ItemPusher.typeId);


function blockPush(e: CustomBlockEventArgs) {
    let block = e.block;
    let facing_direction = block.permutation.getState("minecraft:facing_direction") as "up" | "down" | "north" | "south" | "east" | "west"
    let fromBlock: Block | undefined
    switch (facing_direction) {
        case "up": fromBlock = block.above(); break;
        case "down": fromBlock = block.below(); break;
        case "north": fromBlock = block.north(); break;
        case "south": fromBlock = block.south(); break;
        case "east": fromBlock = block.east(); break;
        case "west": fromBlock = block.west(); break;
    }
    // console.warn(`${fromBlock?.location.x} ${fromBlock?.location.y} ${fromBlock?.location.z}`);

    let fromInventory: BlockInventoryComponent | undefined = fromBlock?.getComponent(BlockInventoryComponent.componentId) as BlockInventoryComponent | undefined
    let fromContainer = fromInventory?.container;
    if (fromContainer == null) {
        return; // TODO: Do some fail representation
    }
    let fromStack: ItemStack | undefined;
    let fromSlots:number[] = [];
    for (let i = 0; i < fromContainer.size; i++) {
        fromStack = fromContainer.getItem(i);
        if (fromStack != null) {    
            fromSlots.push(i);        
        }
    }
    if (fromSlots.length === 0) {
        return; // FAILED, the container is empty
    }
    let currentBlock:Block | undefined = block;
    function step() {
        switch (facing_direction) {
            case "up": return currentBlock?.below(); break;
            case "down": return currentBlock?.above(); break;
            case "north": return currentBlock?.south(); break;
            case "south": return currentBlock?.north(); break;
            case "east": return currentBlock?.west(); break;
            case "west": return currentBlock?.east(); break;
        }
    }
    let toInventory:BlockInventoryComponent | undefined
    do {        
        // console.warn(` ${currentBlock.location.x} ${currentBlock.location.y} ${currentBlock.location.z}`);
        currentBlock = step();
        toInventory = currentBlock?.getComponent(BlockInventoryComponent.componentId) as BlockInventoryComponent | undefined
    } while (toInventory == null && currentBlock != null)
    let toContainer = toInventory?.container;
    if (toContainer == null) {
        return;
    }
    for (let slot of fromSlots) {
        let before = fromContainer.getItem(slot)!.amount
        let after = fromContainer.transferItem(slot, toContainer)?.amount;
        if (before !== after) break;
    }

}

const PushItemEventId = "push_item";

ItemPusher.subscribeCustomEvent(PushItemEventId, blockPush)

ItemPusher.subscribeCustomEvent(PowerOnEventId, blockPush);


export { ItemPusher }




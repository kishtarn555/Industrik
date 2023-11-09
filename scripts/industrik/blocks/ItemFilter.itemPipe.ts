import { Block, BlockInventoryComponent, Container, Direction, ItemStack, system } from "@minecraft/server";
import { ConnectBlock } from "../../connectTogether/Block/connectBlock";
import { ItemPacket, ItemPipeContext } from "../itemPipeSystem/itemPacket";
import ItemPipeComponent from "../itemPipeSystem/itemPipeComponent";

import { ItemFilterBlock } from "./ItemFilter.block";
import { PipeBlock, addConnectorBlock } from "./pipeBlock.connectBlock";
import { getItemPipeComponent } from "../itemPipeSystem/componentRegisrty";
import { PIPE_MAX_DISTANCE } from "../constants";
import { sendItemPacketToFirstNeighbor } from "../itemPipeSystem/pipeUtils";

addConnectorBlock(ItemFilterBlock.typeId);
ItemFilterBlock.subscribeNeighborToBlockUpdates(PipeBlock);
const ItemFilterIPC = new ItemPipeComponent({
    block: ItemFilterBlock,
    onPacketReceive: filterItem
});


function passThrough(packet: ItemPacket) {
    sendItemPacketToFirstNeighbor(
        packet, 
        [   
            packet.context.direction,
            Direction.North,
            Direction.South,
            Direction.East,
            Direction.West
        ]
    );
}

function evaluateItem(itemStack: ItemStack, filterContainer: Container, context: ItemPipeContext): boolean {
    for (let i = 0; i < filterContainer.size; i++) {
        let item = filterContainer.getItem(i);
        if (item == null) continue;
        if (itemStack.isStackableWith(item)) {
            return true;
        }
    }
    return false;
}


function trySendItemFromContainer(sourceContainer: Container, filterContainer: Container, target: ItemPipeComponent, packet: ItemPacket): boolean {
    const down = {
        x: packet.context.location.x,
        y: packet.context.location.y - 1,
        z: packet.context.location.z,
    }
    if (packet.context.forceSourceSlot != null) {
        const item = sourceContainer.getItem(packet.context.forceSourceSlot);
        if (item == null) {
            packet.reject("The source slot is empty");
            return true;
        }
        if (evaluateItem(item, filterContainer, packet.context)) {
            system.run(() =>
                target.onPacketReceive(packet.withContext({
                    dimension: packet.context.dimension,
                    location: down,
                    direction: Direction.Down,
                    distance: packet.context.distance+1, 
                    forceSourceSlot:packet.context.forceSourceSlot
                }
                )

                ));
            return true;
        }
        return false;
    }

    for (let i = 0; i < sourceContainer.size; i++) {
        const item = sourceContainer.getItem(i);
        if (item == null) continue;
        if (evaluateItem(item, filterContainer, packet.context)) {
            system.run(() =>
                target.onPacketReceive(packet.withContext({
                    dimension: packet.context.dimension,
                    location: down,
                    direction: Direction.Down,
                    distance: packet.context.distance+1,
                    forceSourceSlot:i
                }
                )

                ));
            return true;
        }
    }
    return false;
}


function trySendItemFromItem(item: ItemStack, filterContainer: Container, target: ItemPipeComponent, packet: ItemPacket): boolean {
    const down = {
        x: packet.context.location.x,
        y: packet.context.location.y - 1,
        z: packet.context.location.z,
    }

    if (evaluateItem(item, filterContainer, packet.context)) {
        system.run(() =>
            target.onPacketReceive(packet.withContext({
                dimension: packet.context.dimension,
                location: down,
                direction: Direction.Down,
                distance: 0 //NOTE: We restart the distance, allowing the packet to travel further, recheck need to check this, for balancing porpuses
            })

        ));
        return true;
    }
    return false;
}


function filterItem(packet: ItemPacket): boolean {
    if (packet.context.distance > PIPE_MAX_DISTANCE) {
        packet.reject("Pipe distance exceeded");
        return true;
    }
    const block = packet.context.dimension.getBlock(packet.context.location);
    if (block == null) {
        packet.reject("The filter is unloaded");
        return true;
    }
    const filterContainer = (block.above()?.getComponent(BlockInventoryComponent.componentId) as (BlockInventoryComponent | undefined))?.container;
    if (filterContainer == null) {
        passThrough(packet); // There's no filter set up
        return true;
    }
    const neighborBelow = block.below();
    if (neighborBelow == null) {
        passThrough(packet); // There's no block to send filtered items
        return true;
    }
    const filteredTarget = getItemPipeComponent(neighborBelow.typeId);
    if (filteredTarget == null) {
        passThrough(packet); // There's no pipeComponent to receive the filtered item
        return true;
    }


    if (packet.data.Container != null) {
        if (trySendItemFromContainer(packet.data.Container, filterContainer, filteredTarget, packet)) {
            return true;
        }

    } else if (packet.data.itemStack) {
        if (trySendItemFromItem(packet.data.itemStack, filterContainer, filteredTarget, packet)) {
            return true;
        }
    } else if (packet.data.itemEntity) {
        if (trySendItemFromItem(packet.data.itemEntity.itemStack, filterContainer, filteredTarget, packet)) {
            return true;
        }
    }

    passThrough(packet);
    return true;

}

export { ItemFilterIPC }


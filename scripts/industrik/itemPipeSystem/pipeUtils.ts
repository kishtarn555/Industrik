import { Direction } from "@minecraft/server";
import { ItemPacket } from "./itemPacket";
import { getItemPipeComponent } from "./componentRegisrty";
import { getNeighborFromDirection, getOpositeDirection } from "../library/BlockAPI/BlockApi.extension";

function sendItemPacketToFirstNeighbor(packet: ItemPacket, targets: Direction[], allow_returners: boolean = false) {
    const block = packet.context.dimension.getBlock(packet.context.location);
    if (block == null) {
        packet.reject("This block is unloaded");
        return;
    }

    for (let i = 0; i < targets.length; i++) {
        if (!allow_returners && targets[i] === getOpositeDirection(packet.context.direction)) {
            continue;
        }
        const target = getNeighborFromDirection(block, targets[i]);
        if (target == null) {
            continue;
        }
        const compoent = getItemPipeComponent(target.typeId);
        if (compoent == null) {
            continue;
        }
        if (compoent.onPacketReceive(packet.withContext({
            dimension: packet.context.dimension,
            location: target.location,
            direction: targets[i],
            distance: packet.context.distance + 1,
            forceSourceSlot: packet.context.forceSourceSlot
        }))) {
            return;
        }
    }
    packet.reject("Item couldn't be sent further");
}


export {sendItemPacketToFirstNeighbor}

import { Direction } from "@minecraft/server";
import { PIPE_MAX_DISTANCE } from "../constants";
import { getItemPipeComponent } from "../itemPipeSystem/componentRegisrty";
import { ItemPacket } from "../itemPipeSystem/itemPacket";
import ItemPipeComponent from "../itemPipeSystem/itemPipeComponent";
import { sendItemPacketToFirstNeighbor } from "../itemPipeSystem/pipeUtils";
import { getNeighborFromDirection } from "../library/BlockAPI/BlockApi.extension";
import { PipeBlock, ITEM_PIPE_ID } from "./pipeBlock.connectBlock";



const PipeBlockIPC = new ItemPipeComponent({
    block:PipeBlock,
    onPacketReceive:onPipeBlockReceive
},

);


function onPipeBlockReceive(packet:ItemPacket) :boolean {    
    if (packet.context.distance > PIPE_MAX_DISTANCE) {
        packet.reject("Pipe distance exceeded");
        return true;
    }
    const context = packet.context;
    const block = context.dimension.getBlock(context.location);
    if (block == null) {
        packet.reject("An unloaded pipe was accessed");
        return true; 
    }
    sendItemPacketToFirstNeighbor(packet, [
        packet.context.direction,
        Direction.North,
        Direction.South,
        Direction.East,
        Direction.West,
        Direction.Up,
        Direction.Down
    ])
    return true;
}


export {PipeBlockIPC};
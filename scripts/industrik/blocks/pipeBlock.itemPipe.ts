import { getItemPipeComponent } from "../itemPipeSystem/componentRegisrty";
import { ItemPacket } from "../itemPipeSystem/itemPacket";
import ItemPipeComponent from "../itemPipeSystem/itemPipeComponent";
import { getNeighborFromDirection } from "../library/BlockAPI/BlockApi.extension";
import { PipeBlock, ITEM_PIPE_ID } from "./pipeBlock.connectBlock";


const PIPE_MAX_DISTANCE = 30;

const PipeBlockIPC = new ItemPipeComponent({
    block:PipeBlock,
    onPacketReceive:onPipeBlockReceive
},

);


function onPipeBlockReceive(packet:ItemPacket) :boolean {
    const context = packet.context;
    const block = context.dimension.getBlock(context.location);
    if (block == null) {
        packet.reject("An unloaded pipe was accessed");
        return true; 
    }
    if (context.distance > PIPE_MAX_DISTANCE) {
        packet.reject("Pipe distance exceeded");
        return true;
    }
    const nextBlock = getNeighborFromDirection(block, context.direction);
    if (nextBlock==null) {
        packet.reject("Pipe sent to an unloaded block or a block out of bounds")
        return true;
    }
    const component = getItemPipeComponent(nextBlock.typeId);
    if (component == null) {
        packet.reject("Next block does not accept items");
        return true;
    }
    
    component.onPacketReceive(
        packet.withContext({
            dimension:context.dimension,
            location:nextBlock.location,
            direction:context.direction,
            distance:context.distance+1
        })
    );
    return true;
}


export {PipeBlockIPC};
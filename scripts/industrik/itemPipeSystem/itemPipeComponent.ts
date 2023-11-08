import { Block } from "@minecraft/server";
import { ConnectBlock } from "../../connectTogether/Block/connectBlock";
import { PacketPromiseHandler, PacketReceiver } from "../pipes/pipeSender";
import { ItemPacket } from "./itemPacket";


interface ItemPipeComponentData  {
    block:ConnectBlock
    onPacketReceive:PacketPromiseHandler<ItemPacket>
}

class ItemPipeComponent implements PacketReceiver<ItemPacket> {
    block:ConnectBlock;
    onPacketReceive: PacketPromiseHandler<ItemPacket>;
    
    
    constructor(data:ItemPipeComponentData) {
        this.block = data.block;
        this.onPacketReceive = data.onPacketReceive;
    }

    getTypeId() {
        return this.block.typeId;
    }

}

export default ItemPipeComponent;
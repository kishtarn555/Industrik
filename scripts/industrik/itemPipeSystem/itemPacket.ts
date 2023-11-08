import { Container, Dimension, Direction,  EntityItemComponent,  ItemStack, Vector3 } from "@minecraft/server";
import { Packet } from "../pipes/pipeSender";


interface ItemPacketData {
    itemStack?:ItemStack,    
    Container?:Container
    itemEntity?:EntityItemComponent
}

interface ItemPipeContext {
    location:Vector3,
    dimension:Dimension,
    direction:Direction,
    distance:number,
    forceSourceSlot?:number
}

class ItemPacket extends Packet<ItemPacketData, ItemPipeContext> {
    constructor (data:ItemPacketData, context:ItemPipeContext,resolve:(value: any) => void, reject:(reason: any) => void) {
        super(data,context, resolve, reject);
    }

}


export {ItemPacket, ItemPacketData, ItemPipeContext};
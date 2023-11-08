import { system, world } from "@minecraft/server";
import { RegisterBlock } from "../connectTogether/Block/blockRegistry";
import { Addon } from "../connectTogether/index";
import { CableBlock } from "./blocks/Cable";
import { PipeBlock } from "./blocks/pipeBlock.connectBlock";
import { ItemPusher } from "./blocks/ItemPusher.block";
import { PistonConverter } from "./blocks/PistonConverter";
import { PowerSignalTick, RegisterMachineBlock } from "./power/powerSystem";
import { RegisterItemPipeComponent } from "./itemPipeSystem/componentRegisrty";
import { PipeBlockIPC } from "./blocks/pipeBlock.itemPipe";
import { ItemPusherIPC } from "./blocks/ItemPusher.itemPipe";
import { ItemPusherMachine } from "./blocks/itemPusher.power";
import { ItemFilterBlock } from "./blocks/ItemFilter.block";
import { ItemFilterIPC } from "./blocks/ItemFilter.itemPipe";

class IndustrikAddon extends Addon {

    constructor() {
        super("industrik")
    }

    awake(): void {
        
        RegisterBlock(CableBlock.typeId,CableBlock);
        RegisterBlock(PipeBlock.typeId,PipeBlock);
        RegisterBlock(ItemPusher.typeId, ItemPusher);
        RegisterBlock(PistonConverter.typeId, PistonConverter);
        RegisterBlock(ItemFilterBlock.typeId, ItemFilterBlock);
        
        RegisterItemPipeComponent(PipeBlockIPC.getTypeId(), PipeBlockIPC);
        RegisterItemPipeComponent(ItemPusherIPC.getTypeId(), ItemPusherIPC);
        RegisterItemPipeComponent(ItemFilterIPC.getTypeId(), ItemFilterIPC);

        RegisterMachineBlock(ItemPusher.typeId, ItemPusherMachine);
    }

    start(): void {
    }

    tick():void {
        PowerSignalTick();
    }

}


const industrikAddon = new IndustrikAddon();
export {industrikAddon};
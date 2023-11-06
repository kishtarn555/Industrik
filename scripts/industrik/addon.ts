import { system, world } from "@minecraft/server";
import { RegisterBlock } from "../connectTogether/Block/blockRegistry";
import { Addon } from "../connectTogether/index";
import { CableBlock } from "./blocks/Cable";
import { PipeBlock } from "./blocks/ItemPipe";
import { ItemPusher } from "./blocks/ItemPusher";
import { PistonConverter } from "./blocks/PistonConverter";
import { PowerSignalTick } from "./power/powerSystem";

class IndustrikAddon extends Addon {

    constructor() {
        super("industrik")
    }

    awake(): void {
        RegisterBlock(CableBlock.typeId,CableBlock);
        RegisterBlock(PipeBlock.typeId,PipeBlock);
        RegisterBlock(ItemPusher.typeId, ItemPusher);
        RegisterBlock(PistonConverter.typeId, PistonConverter);
    }

    start(): void {
    }

    tick():void {
        PowerSignalTick();
    }

}


const industrikAddon = new IndustrikAddon();
export {industrikAddon};
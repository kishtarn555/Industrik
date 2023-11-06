import { BlockPermutation, system, world } from "@minecraft/server";
import { ConnectBlock, CustomBlockEventArgs } from "../../connectTogether/Block/connectBlock";
import { addConnectorBlock } from "./Cable";
import { emitPower } from "../power/powerSystem";
const PistonConverter = new ConnectBlock(
    {
        identifier: "industrik:piston_converter"
    }
);


addConnectorBlock(PistonConverter.typeId);


function Pulse(e: CustomBlockEventArgs) {
    // ConsumeEnergyNugget();

    let location = e.block.location;
    let dimension = e.block.dimension;
    let state = dimension.getBlock(location)?.permutation.getState("industrik:power") as string;
    let targetState = state  === "on"? "off":"on";
    if (targetState==="on"){
        PistonConverter.callCustomEvent("power_on", e);
    }
    e.block.setPermutation(
        e.block.permutation.withState("industrik:power", targetState)
    );
}

function PowerOn(e: CustomBlockEventArgs) {
  emitPower(e.block.dimension, e.block.location);
}

PistonConverter.subscribeCustomEvent("pulse", Pulse);
PistonConverter.subscribeCustomEvent("power_on", PowerOn);

world.beforeEvents.pistonActivate.subscribe((args) => {
    if (!args.isExpanding) {
        return;//Let this block be pulled
    }
    let blocks = args.piston.getAttachedBlocks()
    if (blocks.length !== 1) {
        return;
    }
    let pushingBlock = args.piston.block.dimension.getBlock(blocks[0]);
    if (pushingBlock?.typeId === PistonConverter.typeId) {
        args.cancel = true;
        system.run(() =>
            PistonConverter.callCustomEvent("pulse", { block: pushingBlock! })
        );
    }

});


export { PistonConverter }



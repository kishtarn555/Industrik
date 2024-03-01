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

world.afterEvents.pistonActivate.subscribe((args) => {
    if (!args.isExpanding) {
        return;//Let this block be pulled
    }
    let blocks = args.piston.getAttachedBlocks()
    if (blocks.length !== 1) {
        return;
    }
    let dx = args.piston.getAttachedBlocksLocations()[0].x - args.block.x;
    let dy = args.piston.getAttachedBlocksLocations()[0].y - args.block.y;
    let dz = args.piston.getAttachedBlocksLocations()[0].z - args.block.z;
    let pushingBlock = blocks[0].dimension.getBlock({
        x:args.block.x-dx,
        y:args.block.y-dy,
        z:args.block.z-dz,
    })
    if (pushingBlock==null) {
        return;
    }
    console.error(pushingBlock.location.x,pushingBlock.location.y,pushingBlock.location.z,)
    console.error(pushingBlock.typeId);
    if (pushingBlock.typeId === PistonConverter.typeId) {
        system.run(() =>
            PistonConverter.callCustomEvent("pulse", { block: pushingBlock! })
        );
    }

});


export { PistonConverter }



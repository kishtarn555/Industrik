import { PlayerPlaceBlockAfterEvent,Block, BlockPermutation } from "@minecraft/server";
import { ConnectBlock } from "../../connectTogether/Block/connectBlock";
import { registerConductor } from "../power/powerSystem";


const CABLE_ID="industrik:cable";

const ConnectsWith:string[]= [
    CABLE_ID,
]

const CableBlock = new ConnectBlock({
    identifier:CABLE_ID,
    onPlace:onPlaceCable,
    onUpdate:onCableBlockUpdate,
});
CableBlock.subscribeNeighborToBlockUpdates(CableBlock);
registerConductor(CABLE_ID);



function placeCable(block:Block) {
    let states:Record<string,boolean> = {
        "industrik:xp":false,
        "industrik:yp":false,
        "industrik:zp":false,
        "industrik:xn":false,
        "industrik:yn":false,
        "industrik:zn":false,
    }
    let neighbors:[Block|undefined,string][] = [
        [block.east(), "industrik:xp"],
        [block.above(),"industrik:yp"],
        [block.south(),"industrik:zp"],
        [block.west(), "industrik:xn"],
        [block.below(),"industrik:yn"],
        [block.north(),"industrik:zn"],
    ];
    for (let neighbor of neighbors) {
        if (neighbor[0]!=undefined && ConnectsWith.indexOf(neighbor[0].typeId)>-1) {
            states[neighbor[1]]=true;
        }
    }

    block.setPermutation(BlockPermutation.resolve(CABLE_ID, states));
}


function onCableBlockUpdate(e:Block) {
    placeCable(e);
}

function onPlaceCable (e:PlayerPlaceBlockAfterEvent) {
    const block = e.block;
    placeCable(block);
}


export function addConnectorBlock(typeId:string) {
    ConnectsWith.push(typeId);
}



export {CABLE_ID, CableBlock};
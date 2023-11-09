import { PlayerPlaceBlockAfterEvent, Block, BlockPermutation } from "@minecraft/server";
import { ConnectBlock } from "../../connectTogether/Block/connectBlock";
import { BlockRegistry } from "../../connectTogether/Block/blockRegistry";


export const ITEM_PIPE_ID = "industrik:item_pipe";

const ConnectsWith: string[] = [
    ITEM_PIPE_ID
]

export const PipeBlock = new ConnectBlock({
    identifier: ITEM_PIPE_ID,
    onPlace: onPlacePipe,
    onUpdate: onPipeBlockUpdate
});

PipeBlock.subscribeNeighborToBlockUpdates(PipeBlock);


function placePipe(block: Block) {
    let states: Record<string, boolean> = {
        "industrik:xp": false,
        "industrik:yp": false,
        "industrik:zp": false,
        "industrik:xn": false,
        "industrik:yn": false,
        "industrik:zn": false,
    }
    let neighbors: [Block | undefined, string][] = [
        [block.east(), "industrik:xp"],
        [block.above(), "industrik:yp"],
        [block.south(), "industrik:zp"],
        [block.west(), "industrik:xn"],
        [block.below(), "industrik:yn"],
        [block.north(), "industrik:zn"],
    ];
    for (let neighbor of neighbors) {
        if (neighbor[0] != undefined && ConnectsWith.indexOf(neighbor[0].typeId) > -1) {
            states[neighbor[1]] = true;
        }
    }

    block.setPermutation(BlockPermutation.resolve(ITEM_PIPE_ID, states));
}


function onPipeBlockUpdate(e: Block) {
    placePipe(e);
}

function onPlacePipe(e: PlayerPlaceBlockAfterEvent) {
    const block = e.block;
    placePipe(block);
}







export function addConnectorBlock(typeId:string) {
    ConnectsWith.push(typeId);
}
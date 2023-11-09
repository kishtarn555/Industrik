import { system } from "@minecraft/server";
import { CustomBlockEventArgs } from "../../connectTogether/Block/connectBlock";
import { PowerBlockMachine, PowerOnEventId, RegisterMachineBlock } from "../power/powerSystem";
import { CableBlock, addConnectorBlock } from "./Cable";
import { ItemPusher } from "./ItemPusher.block";
import { SendItemFromItemPusher } from "./ItemPusher.itemPipe";

const ItemPusherMachine = new PowerBlockMachine({
    block:ItemPusher
});

function PushItem(e:CustomBlockEventArgs) {
    system.run(()=>SendItemFromItemPusher(e.block));
}

ItemPusher.subscribeCustomEvent(PowerOnEventId, PushItem)

ItemPusher.subscribeNeighborToBlockUpdates(CableBlock);
addConnectorBlock(ItemPusher.typeId);



export {ItemPusherMachine}
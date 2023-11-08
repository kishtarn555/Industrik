import { ConnectBlock, CustomBlockEventArgs } from "../../connectTogether/Block/connectBlock";
import { CableBlock, addConnectorBlock as appendCableConnector } from "./Cable";
import { PipeBlock, addConnectorBlock as appendPipeConnector } from "./pipeBlock.connectBlock";
import { PowerBlockMachine, PowerOnEventId, RegisterMachineBlock } from "../power/powerSystem";

const ItemPusherId="industrik:item_pusher";
const ItemPusher = new ConnectBlock(
    {
        identifier: ItemPusherId,

    }
)
export { ItemPusher }




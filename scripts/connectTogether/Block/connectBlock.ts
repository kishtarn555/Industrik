import {PlayerPlaceBlockAfterEvent,PlayerBreakBlockAfterEvent, Block, Entity } from "@minecraft/server";
import { BlockRegistry } from "./blockRegistry";

export type OnPlaceEvent=(e:PlayerPlaceBlockAfterEvent)=> void
export type OnBreakEvent=(e:PlayerBreakBlockAfterEvent)=> void
export type OnUpdateEvent=(e:Block)=>void

type CustomEventMap = Map<string, Set<(e:CustomBlockEventArgs)=>void> >

interface AdvancedBlockData{
    identifier:string,
    customEvents?: CustomEventMap
    onPlace?:OnPlaceEvent,
    onBreak?:OnBreakEvent,
    onUpdate?:OnUpdateEvent    
    updatableBlocks?:Set<ConnectBlock>
}

export interface CustomBlockEventArgs {
    block:Block,
    payload?:string
    source?:Entity|Block
}

export class ConnectBlock {
    typeId:string;
    private onAwake: (()=>void) | undefined

    private onPlace:OnPlaceEvent | undefined
    private onBreak:OnBreakEvent | undefined
    private onBlockUpdate:OnUpdateEvent | undefined
    
    private updatableBlocks:Set<ConnectBlock>

    private customEvents: CustomEventMap

    constructor(data:AdvancedBlockData) {
        this.typeId=data.identifier;
        this.onPlace=data.onPlace;
        this.onBreak=data.onBreak;
        this.onBlockUpdate=data.onUpdate;
        this.customEvents = data.customEvents ?? new Map<string, Set<(e:CustomBlockEventArgs)=>void> >();
        this.updatableBlocks=data.updatableBlocks ?? new Set<ConnectBlock>()
    }


    triggerBlockUpdateOnNeighbors(block:Block) {
        let neighbors = [
            block.above(), block.below(), block.south(), block.north(), block.east(), block.west()
        ];
        for (let neighbor of neighbors) {
            if (neighbor==null) {
                continue; // skip this non existant neighbor
            }
            let neighborId = neighbor.typeId;            
            let neighborBlock = ConnectBlock.getConnectBlock(neighborId);
            if (neighborBlock == null) {
                continue; // No connect behavior found on neighbor block
            }
            if (this.updatableBlocks.has(neighborBlock)) {
                neighborBlock.callBlockUpdate(neighbor);
            }
        }
    }


    callPlacementEvent(e:PlayerPlaceBlockAfterEvent) {
        this.onPlace?.(e);
        this.triggerBlockUpdateOnNeighbors(e.block);
        
    }

    callBreakEvent(e:PlayerBreakBlockAfterEvent) {
        this.onBreak?.(e);
        this.triggerBlockUpdateOnNeighbors(e.block);
    }

    callBlockUpdate(e:Block) {
        this.onBlockUpdate?.(e);
    }
    
    callCustomEvent(eventId:string, e:CustomBlockEventArgs):boolean {
        let event = this.customEvents.get(eventId);
        if (event==null) {
            return false; // THis block does not have this custom event
        }
        let response=false;
        for (let callback of event) {
            callback(e);
            response = true;
        }
        return response;
    }



    subscribeNeighborToBlockUpdates(target:ConnectBlock) {
        this.updatableBlocks.add(target);
    }

    unsubscribeNeighborToBlockUpdates(target:ConnectBlock) {
        this.updatableBlocks.delete(target);
    }

    subscribeCustomEvent(eventId:string, callback:(e:CustomBlockEventArgs)=>void) {
        if (!this.customEvents.has(eventId)) {
            this.customEvents.set(eventId, new Set<(e:CustomBlockEventArgs)=>void>);
        }
        this.customEvents.get(eventId)!.add(callback);
    }

    
    static getConnectBlock(block:Block | string) {
        let id:string;
        if (block instanceof Block) {
            id = block.typeId;
        } else {
            id = block;
        }
        return BlockRegistry.get(id);
    }


}
import { Block, Dimension, Vector3, system } from "@minecraft/server";
import { ConnectBlock } from "../../connectTogether/Block/connectBlock";


const Machines:Map<string, PowerBlockMachine> = new  Map<string, PowerBlockMachine>();
const PowerOnEventId="power_on"

const SignalConductors:Set<string> = new Set<string>();

interface CircuitSignal {
    power:number,
    location:Vector3
    dimension:Dimension,
    source:Vector3

}

let queue:CircuitSignal[]=[]
let nextQueue:CircuitSignal[]=[]


let processedBlocks: Set<string> =new Set<string>()

const EMISSION_POWER = 15;

let QUEUE_MAX_LENGTH = 65536;

function pushToNext(dimension:Dimension, location: Vector3, power:number, source:Vector3) {
    if (nextQueue.length > QUEUE_MAX_LENGTH) {
        console.error("[PowerSystem], queue capacity exceeded, signals are being lost");
        return;
    }
    nextQueue.push({
        power:power,
        location: location,
        dimension:dimension,
        source:source
    });
}

function pushToCurrent(dimension:Dimension, location: Vector3, power:number, source:Vector3) {
    if (queue.length > QUEUE_MAX_LENGTH) {
        console.error("[PowerSystem], queue capacity exceeded, signals are being lost");
        return;
    }
    queue.push({
        power:power,
        location: location,
        dimension:dimension,
        source:source
    });
}

function emitPower(dimension:Dimension, location: Vector3) {
    pushToNext(dimension, location, EMISSION_POWER, location);
}


function prepareNextRound() {
    queue = nextQueue
    nextQueue = [] //Is this the best performance in QuickJS?
    processedBlocks.clear() // Is this fastest?
}

function getNeighbors(block:Block):Block[] {
    let result:Block[] = []
    let above = block.above();
    let below = block.below();
    let east = block.east();
    let west = block.west();
    let south = block.south();
    let north = block.north();

    if (above!=null) result.push(above);
    if (below!=null) result.push(below);
    if (north!=null) result.push(north);
    if (south!=null) result.push(south);
    if (east!=null) result.push(east);
    if (west!=null) result.push(west);
    return result;
}

function locationToString(location:Vector3) {
    return `${location.x} ${location.y} ${location.z}`
}

function propagate() {
    if (queue.length===0) {
        return;
    }
    
    for (let starter of queue) {
        processedBlocks.add(locationToString(starter.location));
    }
    let idx =0;
    while (idx < queue.length) {
        let current = queue[idx];
        idx++;
        let block = current.dimension.getBlock(current.location);
        if (block == null) {
            continue;
        }
        
        let neighbors = getNeighbors(block);
        for (let neighbor of neighbors) {
            if (Machines.has(neighbor.typeId)) {
                let machine = Machines.get(neighbor.typeId)!
                system.run(()=>machine.block.callCustomEvent(PowerOnEventId, {block:neighbor, payload:JSON.stringify(current)   }));
                continue;
            }
            if (current.power <= 1) continue;
            if (processedBlocks.has(locationToString(neighbor.location)) || !SignalConductors.has(neighbor.typeId)) {
                continue;
            }
            pushToCurrent(neighbor.dimension, neighbor.location, current.power-1, current.source);
            processedBlocks.add(locationToString(neighbor.location));
        }
    }
}


function systemTick() {
    let tick = system.currentTick;
    if (tick%2===1) {
        prepareNextRound();
        propagate();
    }
}


interface PowerBlockMachineData {
    block:ConnectBlock
}

class PowerBlockMachine {
    block:ConnectBlock

    constructor(data:PowerBlockMachineData) {
        this.block = data.block;
    }
}

function registerConductor(typeId:string) {
    SignalConductors.add(typeId);
}

function RegisterMachineBlock(typeId:string, machine:PowerBlockMachine) {
    Machines.set(typeId, machine);
}


export {emitPower, systemTick as PowerSignalTick, registerConductor,PowerOnEventId, RegisterMachineBlock, PowerBlockMachine}
// function

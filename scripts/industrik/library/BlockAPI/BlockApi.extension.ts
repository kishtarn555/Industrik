import { Block, Direction } from "@minecraft/server";


export function getNeighborFromDirection(block: Block, direction: Direction): Block | undefined {
    switch (direction) {
        case Direction.Down:
            return block.below();
        case Direction.Up:
            return block.above();
        case Direction.East:
            return block.east();
        case Direction.West:
            return block.west();
        case Direction.South:
            return block.south();
        case Direction.North:
            return block.north();
    }
}

export function getDirectionFromState(direction: "up" | "down" | "north" | "south" | "east" | "west"): Direction {
    switch (direction) {
        case "down":
            return Direction.Down;
        case "up":
            return Direction.Up;
        case "east":
            return Direction.East;
        case "west":
            return Direction.West;
        case "south":
            return Direction.South;
        case "north":
            return Direction.North;
    }
}

export function getOpositeDirection(direction:Direction):Direction {
    switch (direction) {
        case Direction.Down:
            return Direction.Up;
        case Direction.Up:
            return Direction.Down;
        case Direction.East:
            return Direction.West;
        case Direction.West:
            return Direction.East;
        case Direction.South:
            return Direction.North;
        case Direction.North:
            return Direction.South;
    }
}
import { system } from "@minecraft/server";

export abstract class Addon {
    identifier:string

    constructor (identifier:string) {
        this.identifier = identifier;
    }

    abstract awake():void;
    abstract start():void;
    abstract tick():void;
}
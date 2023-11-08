import { system } from "@minecraft/server";
import { Addon } from "./connectTogether";
import { industrikAddon } from "./industrik/addon";

const addons:Addon[] = [industrikAddon]


for (let addon of addons) {
  addon.awake();
}
for (let addon of addons) {
  addon.start();
}


function mainTick() {
  for (let addon of addons) {
    addon.tick();
  }
  system.run(mainTick)
}


system.run(mainTick);
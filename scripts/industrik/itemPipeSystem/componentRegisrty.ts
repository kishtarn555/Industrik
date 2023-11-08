import ItemPipeComponent from "./itemPipeComponent";


const ItemPipeComponents = new Map<string, ItemPipeComponent>()





function RegisterItemPipeComponent(typeId:string, component:ItemPipeComponent) {
    ItemPipeComponents.set(typeId, component);
}


function getItemPipeComponent(typeId:string):ItemPipeComponent|undefined {
    return ItemPipeComponents.get(typeId);
}


export {RegisterItemPipeComponent, getItemPipeComponent};
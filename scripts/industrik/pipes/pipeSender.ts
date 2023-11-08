
type PacketPromiseHandler<T extends Packet<any, any>> = (packet:T)=>boolean;

class Packet<T,K> {
    readonly data:T
    readonly context:K
    readonly resolve:(value:any)=>void
    readonly reject:(reason:any)=>void

    constructor (data:T,  context:K,resolve:(value:any)=>void, reject:(reason:any)=>void) {
        this.data = data;
        this.context = context;
        this.resolve = resolve;
        this.reject = reject;
    }

    withContext(newContext:K) {
        return new Packet<T,K>(this.data, newContext, this.resolve, this.reject);
    }
}

interface PacketReceiver<T extends Packet<any, any>> {
    onPacketReceive: PacketPromiseHandler<T>
}

export {PacketPromiseHandler, PacketReceiver, Packet}
import io from "socket.io-client";
import {createContext} from "react";


class Owner {
    nodePubKey!: string;
    alias!: string;

    public clone(): Owner {
        const result = new Owner();
        result.nodePubKey = this.nodePubKey;
        result.alias = this.alias;
        return result;
    }
}

class Order {
    id!: string;
    price!: string;
    amount!: string;
    owner!: Owner;

    public clone(): Order {
        const result = new Order();
        result.id = this.id;
        result.price = this.price;
        result.amount = this.amount;
        result.owner = this.owner.clone();
        return result;
    }
}

class OrderBook {
    version: number = 0
    asks: Array<Order> = []
    bids: Array<Order> = []

    public clone(): OrderBook {
        const result = new OrderBook();
        result.version = this.version;
        result.asks = [...this.asks.map(i => i.clone())]
        result.bids = [...this.bids.map(i => i.clone())]
        return result;
    }

    public update(side: string, order: Order) {
        let orders = side === "asks"? this.asks : this.bids
        const targets = orders.filter(i => i.id === order.id)
        if (targets.length === 1) {
            targets[0].amount = order.amount
        } else if (targets.length === 0) {
            orders.push(order)
        }
        orders = orders.filter(i => i.amount !== "0");
        if (side === "asks") {
            this.asks = [...orders]
        } else {
            this.bids = [...orders]
        }
    }
}


function deserializeOwner(j: any) {
    const owner = new Owner()
    owner.nodePubKey = j["nodePubKey"]
    owner.alias = j["alias"]
    return owner;
}

function deserializeOrder(j: any) {
    const order = new Order()
    order.id = j["id"]
    order.price = j["price"]
    order.amount = j["amount"]
    if (j["owner"]) {
        order.owner = deserializeOwner(j["owner"])
    }
    return order
}

function deserializeOrderBook(j: any) {
    const result = new OrderBook()
    result.version = j["version"]
    result.asks = j["asks"].map(deserializeOrder)
    result.bids = j["bids"].map(deserializeOrder)

    return result
}

async function fetchOrders(pair: string): Promise<OrderBook> {
    const r = await fetch(`/api/orders/${pair}`)
    const j = await r.json();
    return deserializeOrderBook(j);
}

async function fetchPairs(): Promise<Array<string>> {
    const r = await fetch("/api/pairs")
    const j = await r.json()
    console.log(j)
    return j
}

const socket = io({
    transports: ["websocket"],
});

const SocketContext = createContext(socket)

export {
    Order, OrderBook, fetchOrders, fetchPairs, SocketContext, deserializeOrderBook, deserializeOrder, deserializeOwner
}




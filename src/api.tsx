import io from "socket.io-client";
import {createContext} from "react";
import {Big} from "big.js";


class BasicInfo {
    version!: string;
    network!: string;
    nodePubKey!: string;
    nodeAlias!: string;
}

class Order {
    price!: string;
    amount!: string;

    public clone(): Order {
        const result = new Order();
        result.price = this.price;
        result.amount = this.amount;
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
        let orders = side === "ask"? this.asks : this.bids
        const targets = orders.filter(i => i.price === order.price)
        if (targets.length === 1) {
            targets[0].amount = order.amount
        } else if (targets.length === 0) {
            orders.push(order)
        } else {
            throw new Error("Duplicated price")
        }
        console.log("a", side, order, orders)
        orders = orders.filter(i => i.amount !== "0");
        console.log("b", side, order, orders)
        if (side === "ask") {
            this.asks = [...orders].sort((a, b) => {
                return new Big(a.price).cmp(new Big(b.price))
            })
        } else {
            this.bids = [...orders].sort((a, b) => {
                return new Big(b.price).cmp(new Big(a.price))
            })
        }
    }
}


function deserializeBasicInfo(j: any): BasicInfo {
    const info = new BasicInfo();
    info.version = j["version"];
    info.network = j["network"];
    info.nodePubKey = j["nodePubKey"];
    info.nodeAlias = j["nodeAlias"];
    return info;
}

function deserializeOrder(j: any): Order {
    const order = new Order()
    order.price = j["price"]
    order.amount = j["amount"]
    return order
}

function deserializeOrderBook(j: any): OrderBook {
    const result = new OrderBook()
    result.version = j["version"]
    result.asks = j["asks"].map(deserializeOrder)
    result.bids = j["bids"].map(deserializeOrder)

    return result
}

async function fetchInfo(): Promise<BasicInfo> {
    const r = await fetch(`/api/info`);
    const j = await r.json();
    return deserializeBasicInfo(j);
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

const socket = io( {
    path: "/api-ws",
    transports: ["websocket"],
});

const SocketContext = createContext(socket)

export {
    // Models
    BasicInfo, deserializeBasicInfo,
    Order, deserializeOrder,
    OrderBook, deserializeOrderBook,
    // APIs
    fetchInfo,
    fetchPairs,
    fetchOrders,
    // Context
    SocketContext,
}




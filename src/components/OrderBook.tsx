import React, {FunctionComponent, useContext, useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import {deserializeOrderBook, fetchOrders, Order, OrderBook as _OrderBook, SocketContext} from "../api";
import {Big} from "big.js";

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(2),
        textAlign: "center",
        color: theme.palette.text.secondary,
    },
    number: {
       fontFamily: "monospace",
    }
}))

interface OrderEntryProps {
    order: Order,
    side: string,
}

const OrderEntry: FunctionComponent<OrderEntryProps> = ({order, side}) => {
    const {price, amount} = order

    let p = new Big(price);
    let a = new Big(amount);
    let pd = 6;
    let ad = 2;
    let pdc = p.c.length - 1 - p.e;
    let adc = a.c.length - 1 - a.e;
    let pz = pd - pdc;
    let az = ad - adc;

    if (side === "ask") {
        return (
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <Box fontFamily="Monospace" style={{color: "red"}} fontSize={14}>
                        <span>{price}</span>
                        {pz > 0 && <span style={{color: "#d2acac"}}>{'0'.repeat(pz)}</span>}
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box fontFamily="Monospace" fontSize={14}>
                        <span>{amount}</span>
                        {az > 0 && <span style={{color: "#dedede"}}>{'0'.repeat(az)}</span>}
                    </Box>
                </Grid>
            </Grid>
        )
    } else {
        return (
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <Box fontFamily="Monospace" fontSize={14}>
                        <span>{amount}</span>
                        {az > 0 && <span style={{color: "#dedede"}}>{'0'.repeat(az)}</span>}
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box fontFamily="Monospace" style={{color: "green"}} fontSize={14}>
                        <span>{price}</span>
                        {pz > 0 && <span style={{color: "#a9bfa9"}}>{'0'.repeat(pz)}</span>}
                    </Box>
                </Grid>
            </Grid>
        )
    }


}


interface OrderBookProps {
    pair: string
}

function parsePair(pair: string) {
    const [base_symbol, quote_symbol] = pair.split("_")
    return [base_symbol.toUpperCase(), quote_symbol.toUpperCase()]
}

const OrderBook: FunctionComponent<OrderBookProps> = ({pair}) => {
    const classes = useStyles()
    const [base_symbol, quote_symbol] = parsePair(pair);
    const [book, setBook] = useState<_OrderBook>(new _OrderBook())
    const [update, setUpdate] = useState<_OrderBook | null>(null)

    const socket = useContext(SocketContext)

    useEffect(() => {
        if (update) {
            console.log("update", update);
            const newBook = book.clone()
            console.log("state1", newBook, book);
            newBook.version = update.version
            update.asks.forEach(i => newBook.update("ask", i))
            update.bids.forEach(i => newBook.update("bid", i))
            console.log("state", newBook);
            setUpdate(null);
            setBook(newBook)
        }
    }, [update, book])

    useEffect(() => {
        const callback = (data: any) => {
            const j = JSON.parse(data)
            const update = deserializeOrderBook(j)
            setUpdate(update)
        }
        const event = `orders/${pair}`
        socket.on(event, callback)

        fetchOrders(pair).then(book => {
            setBook(book);
            console.log("state", book);
        })

        return () => {
            socket.off(event, callback)
        }
    }, [socket, pair])

    const {asks, bids} = book;

    return (
        <div>
            <Box p={3}>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <Typography variant="subtitle2">Buy Orders</Typography>
                        <Paper className={classes.paper}>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>Quantity({base_symbol})</Grid>
                                <Grid item xs={6}>Price({quote_symbol})</Grid>
                            </Grid>
                            {
                                bids.length > 0 ?
                                    bids.map((order, idx) =>
                                        <OrderEntry order={order} key={idx} side="bid"/>) :
                                    <div style={{padding: 100, color: "lightgray"}}>No orders</div>
                            }
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="subtitle2">Sell Orders</Typography>
                        <Paper className={classes.paper}>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>Price({quote_symbol})</Grid>
                                <Grid item xs={6}>Quantity({base_symbol})</Grid>
                            </Grid>
                            {
                                asks.length > 0 ?
                                    asks.map((order, idx) =>
                                        <OrderEntry order={order} key={idx} side="ask"/>) :
                                    <div style={{padding: 100, color: "lightgray"}}>No orders</div>
                            }
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </div>
    );
}

export default OrderBook;

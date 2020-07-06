import React, {FunctionComponent, useContext, useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import {deserializeOrderBook, fetchOrders, Order, OrderBook as _OrderBook, SocketContext} from "../api";

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
    const {price, amount, owner} = order
    const classes = useStyles()

    if (side === "ask") {
        return (
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <Box fontFamily="Monospace" style={{color: "red"}} fontSize={14}>{price}</Box>
                </Grid>
                <Grid item xs={6}>
                    <Box fontFamily="Monospace" fontSize={14}>{amount}</Box>
                </Grid>
            </Grid>
        )
    } else {
        return (
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <Box fontFamily="Monospace" fontSize={14}>{amount}</Box>
                </Grid>
                <Grid item xs={6}>
                    <Box fontFamily="Monospace" style={{color: "green"}} fontSize={14}>{price}</Box>
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
    const [orders, setOrders] = useState<_OrderBook>(new _OrderBook())

    const socket = useContext(SocketContext)

    useEffect(() => {
        const callback = (data: any) => {
            const j = JSON.parse(data)
            const book = deserializeOrderBook(j)
            console.log("update", book)
            const result = orders.clone()
            result.version = book.version
            book.asks.forEach(order => result.update("asks", order))
            book.bids.forEach(order => result.update("bids", order))
            console.log("state", result)
            setOrders(result)
        }
        const event = `orders/${pair}`
        socket.on(event, callback)

        fetchOrders(pair).then(orders => setOrders(orders))

        return () => {
            socket.off(event, callback)
        }
    }, [pair])

    const {asks, bids} = orders;

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

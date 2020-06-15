import React from 'react';
import PropTypes, {func} from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }
}))

function OrderEntry(props) {
  const {order, side} = props;
  const {price, quantity, node_identifier} = order
  console.log(node_identifier)
  return (
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <span style={side === "ask" ? {color: "red"} : {color: "green"}}>{price}</span>
        </Grid>
        <Grid item xs={4}>
          <span>{quantity}</span>
        </Grid>
        <Grid item xs={4}>
          <Tooltip title={node_identifier["node_pub_key"]} aria-label={node_identifier["node_pub_key"]} interactive>
            <span>{node_identifier["alias"] ? node_identifier["alias"] : "Anonymous"}</span>
          </Tooltip>
        </Grid>
      </Grid>
  )
}

function Orderbook(props) {
  const {value, index, orders, pair} = props;
  const classes = useStyles()
  const [base_symbol, quote_symbol] = pair.split("/")
  const {sell_orders: asks, buy_orders: bids} = orders

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`orderbook-${index}`}
      aria-labelledby={`orderbook-label-${index}`}
    >
      {value === index && (
        <Box p={3}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Ask Orders</Typography>
              <Paper className={classes.paper}>
                <Grid container spacing={3}>
                  <Grid item xs={4}>Price({quote_symbol})</Grid>
                  <Grid item xs={4}>Amount({base_symbol})</Grid>
                  <Grid item xs={4}>Node</Grid>
                </Grid>
                {asks.length > 0 ? asks.map((order, idx) => <OrderEntry order={order} key={idx} side="ask"/>) : <div style={{padding: 100, color: "lightgray"}}>No orders</div>}
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Bid Orders</Typography>
              <Paper className={classes.paper}>
                <Grid container spacing={3}>
                  <Grid item xs={4}>Price({quote_symbol})</Grid>
                  <Grid item xs={4}>Amount({base_symbol})</Grid>
                  <Grid item xs={4}>Node</Grid>
                </Grid>
                {bids.length > 0 ? bids.map((order, idx) => <OrderEntry order={order} key={idx} side="bid"/>): <div style={{padding: 100, color: "lightgray"}}>No orders</div>}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
    </div>
  );
}

Orderbook.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
  orders: PropTypes.any.isRequired,
  pair: PropTypes.any.isRequired,
};

export default Orderbook;

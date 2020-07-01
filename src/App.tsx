import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import OrderBook from "./components/OrderBook";
import {XudClient} from "./proto/xudrpc_grpc_web_pb";
import {GetInfoRequest, GetInfoResponse} from "./proto/xudrpc_pb";


function a11yProps(index: number) {
  return {
    id: `orderbook-label-${index}`,
    "aria-controls": `orderbook-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}))

async function fetchOrders() {
  const r = await fetch("/api/v1/orders")
  return await r.json()
}

function SimpleTabs() {
  const classes = useStyles();
  const [value, setValue] = React.useState<number>(0);
  const [version, setVersion] = React.useState<string | null>(null);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  const [orders, setOrders] = useState<{[key: string]: any} | null>(null)

  useEffect(() => {
    const client = new XudClient("http://192.168.11.2:9090")
    const req = new GetInfoRequest()
    client.getInfo(req, undefined, (err, resp) => {
      console.log(err)
      //const version = resp.getVersion()
      //setVersion(version)
    })
  }, [])

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange}>
          {orders && Object.keys(orders).map((key, idx) => (
            <Tab label={key} key={idx} {...a11yProps(idx)}/>
          ))}
        </Tabs>
      </AppBar>
      <div>{version}</div>
      {
        orders && Object.keys(orders).map((key, idx) => (
          <OrderBook value={value} index={idx} key={idx} orders={orders[key]} pair={key}/>
        ))
      }
    </div>
  );
}

export default () => (
    <div>
      <SimpleTabs/>
    </div>
)

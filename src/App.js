import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Orderbook from "./components/Orderbook";


function a11yProps(index) {
  return {
    id: `orderbook-label-${index}`,
    'aria-controls': `orderbook-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

async function fetchOrders() {
  const r = await fetch("/api/v1/orders")
  return await r.json()
}

function SimpleTabs() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [orders, setOrders] = useState(null)

  useEffect(() => {
    (async () => {
      const result = await fetchOrders()
      setOrders(result["orders"])
    })()
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
      {
        orders && Object.keys(orders).map((key, idx) => (
          <Orderbook value={value} index={idx} key={idx} orders={orders[key]} pair={key}/>
        ))
      }
    </div>
  );
}


function App() {
  return (
    <div>
      <SimpleTabs/>
    </div>
  );
}

export default App;

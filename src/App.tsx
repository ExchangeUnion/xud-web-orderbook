import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Tooltip from '@material-ui/core/Tooltip';
import OrderBook from "./components/OrderBook";
import {fetchInfo, fetchPairs, BasicInfo} from "./api";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
    title: {
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
        marginRight: 24,
    },
    nav: {
        flexGrow: 1,
    },
    pairs: {
        margin: theme.spacing(0, 0.5, 0, 1),
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'block',
        },
    },
}))

function SimpleTabs() {

    const classes = useStyles();
    const [pairs, setPairs] = useState<Array<string>>([]);
    const [selectedPair, setSelectedPair] = useState<string | null>(localStorage.getItem("pair"))
    const [info, setInfo] = useState<BasicInfo | null>(null)

    useEffect(() => {
        fetchInfo().then(info => setInfo(info))
        fetchPairs().then(pairs => {
            setPairs(pairs)
            if (! selectedPair || ! pairs.includes(selectedPair)) {
                setSelectedPair(pairs[0])
            }
        })
    }, [])

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar variant="dense">
                    <Typography className={classes.title} variant="h6" noWrap>
                        OpenDEX
                    </Typography>
                    <div className={classes.nav}>
                        <Tooltip title={"Change trading pair"} enterDelay={300}>
                            <Button
                                color="inherit"
                                aria-owns="pairs-menu"
                                aria-haspopup="true"
                                aria-label="Change trading pair"
                                onClick={handleClick}
                            >
                                <span className={classes.pairs}>
                                    {selectedPair && selectedPair.replace("_", "/")}
                                </span>
                                <ExpandMoreIcon fontSize="small"/>
                            </Button>
                        </Tooltip>
                    </div>
                    <Menu
                        id="pairs-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        {pairs.map((pair, idx) => (
                            <MenuItem
                                component="a"
                                data-no-link="true"
                                key={pair}
                                // selected={userLanguage === language.code}
                                onClick={() => {
                                    const selectedPair = pairs[idx]
                                    localStorage.setItem("pair", selectedPair)
                                    setSelectedPair(selectedPair)
                                    handleClose()
                                }}
                            >
                                {pair.toUpperCase().replace("_", "/")}
                            </MenuItem>
                        ))}
                    </Menu>
                    {info && <span><span style={{textTransform: "capitalize"}}>{info.network}</span> | <span>XUD {info.version}</span></span>}
                </Toolbar>
            </AppBar>
            {
                selectedPair && <OrderBook pair={selectedPair}/>
            }
        </div>
    );
}

export default () => (
    <div>
        <SimpleTabs/>
    </div>
)

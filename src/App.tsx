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
import {fetchPairs} from "./api";

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
    const [selectedPair, setSelectedPair] = React.useState<number>(0)

    useEffect(() => {
        fetchPairs().then(pairs => setPairs(pairs))
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
                        Exchange Union
                    </Typography>
                    <Tooltip title={"Change trading pair"} enterDelay={300}>
                        <Button
                            color="inherit"
                            aria-owns="pairs-menu"
                            aria-haspopup="true"
                            aria-label="Change trading pair"
                            onClick={handleClick}
                        >
                            <span className={classes.pairs}>
                                {pairs[selectedPair] && pairs[selectedPair].replace("_", "/")}
                            </span>
                            <ExpandMoreIcon fontSize="small"/>
                        </Button>
                    </Tooltip>
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
                                    setSelectedPair(idx)
                                    handleClose()
                                }}
                            >
                                {pair.toUpperCase().replace("_", "/")}
                            </MenuItem>
                        ))}
                        {/*<Box my={1}>*/}
                        {/*    <Divider/>*/}
                        {/*</Box>*/}
                        {/*<MenuItem*/}
                        {/*    component="a"*/}
                        {/*    data-no-link="true"*/}
                        {/*    rel="noopener nofollow"*/}
                        {/*    key="search"*/}
                        {/*    onClick={handleClose}*/}
                        {/*>*/}
                        {/*    Search pairs*/}
                        {/*</MenuItem>*/}
                    </Menu>
                    <span>Simnet | 1.0.0-beta.4</span>
                </Toolbar>
            </AppBar>
            {
                pairs[selectedPair] && <OrderBook pair={pairs[selectedPair]}/>
            }
        </div>
    );
}

export default () => (
    <div>
        <SimpleTabs/>
    </div>
)

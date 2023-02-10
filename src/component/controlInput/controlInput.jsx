import { Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import { useReducer } from 'react';
import moment from 'moment';

ControlInput.propTypes = {
    onFileChange: PropTypes.func,
    onLoadClick: PropTypes.func
}

function ControlInput(props) {
    const { onFileChange, onLoadClick } = props;
    const [formInput, setFormInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            symbol: "BTCUSDT",
            interval: "5m",
            from: moment().subtract(2, 'days').format("DD/MM/YYYY"),
            to: moment().format("DD/MM/YYYY")
        }
    );

    const handleOnSubmit = e => {
        e.preventDefault();
        onLoadClick(formInput);
    }

    const handleInput = evt => {
        const name = evt.target.name;
        let newValue = evt.target.value;
        setFormInput({ ...formInput, [name]: newValue });
    };

    return (<Grid container spacing={2}>
        <Grid item xs={6}>
            <Grid container spacing={6}>
                <Grid item xs={12}>
                    <Button variant="contained" component="label">
                        Choose first file
                        <input hidden accept="text/csv" type="file" name="firstChart"
                               onChange={onFileChange}/>
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <form onSubmit={handleOnSubmit}>
                        <TextField id="outlined-basic" margin="dense" label="Symbol" variant="outlined" name="symbol"
                                   placeholder="BTCUSDT" defaultValue={formInput.symbol} onChange={handleInput}/>
                        <TextField id="outlined-basic" margin="dense" label="From" variant="outlined" name="from"
                                   placeholder="1/1/2023" defaultValue={formInput.from} onChange={handleInput}/>
                        <TextField id="outlined-basic" margin="dense" label="To" variant="outlined" name="to"
                                   placeholder="10/1/2023" defaultValue={formInput.to} onChange={handleInput}/>
                        <FormControl sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="interval-label">Interval</InputLabel>
                            <Select
                                labelId="interval-label"
                                id="interval-helper"
                                value={formInput.interval}
                                label="Interval"
                                name="interval"
                                onChange={handleInput}
                            >
                                <MenuItem value="1m">1m</MenuItem>
                                <MenuItem value="5m">5m</MenuItem>
                                <MenuItem value="15m">15m</MenuItem>
                                <MenuItem value="30m">30m</MenuItem>
                                <MenuItem value="2h">2h</MenuItem>
                                <MenuItem value="1d">1d</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant="contained" type="submit">Submit</Button>
                    </form>

                </Grid>
            </Grid>
        </Grid>
        <Grid item xs={6}>
            <Button variant="contained" component="label" color="error">
                Choose second file
                <input hidden accept="text/csv" type="file" name="secondChart"
                       onChange={onFileChange}/>
            </Button>
        </Grid>
    </Grid>);
}


export default ControlInput;

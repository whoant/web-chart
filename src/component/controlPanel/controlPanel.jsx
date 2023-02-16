import { FormControl, FormControlLabel, FormGroup, FormLabel, Switch } from '@mui/material';
import PropTypes from 'prop-types';

ControlPanel.propTypes = {
    onShowChart: PropTypes.func,
    state: PropTypes.object
};

function ControlPanel(props) {
    const { onShowChart, state } = props;

    return (<FormControl component="fieldset" variant="standard">
        <FormLabel component="legend">Control panel</FormLabel>
        <FormGroup>
            <FormControlLabel
                control={
                    <Switch checked={state.firstChart} name="firstChart" onChange={onShowChart}/>
                }
                label="Show first chart"
            />
            <FormControlLabel
                control={
                    <Switch checked={state.secondChart} name="secondChart" onChange={onShowChart}/>
                }
                label="Show second chart"
            />
            <FormControlLabel
                control={
                    <Switch checked={state.thirdChart} name="thirdChart" onChange={onShowChart}/>
                }
                label="Show percent chart"
            />
        </FormGroup>
    </FormControl>)
}

export default ControlPanel;

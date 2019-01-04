import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { reverseStationOrder, selectStation, changeTrainDepartureTime } from 'actions/index';

import { Button, Container, Text, utils } from 'styled-minimal';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';

import { filter } from 'lodash';

import Projection from 'components/Projection'

const { spacer } = utils;

const HomeContainer = styled.div`
  padding: 32px;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: ${spacer(3)};
  text-align: center;

  svg {
    width: 20rem;
  }
`;

const Heading = styled.h1`
  color: #000;
  font-size: 2rem;
  line-height: 1.4;
  margin-bottom: ${spacer(2)};
  margin-top: 0;
  text-align: center;

  /* stylelint-disable */
  ${utils.responsive({
    lg: `
      font-size: 2rem;
    `,
  })};
  /* stylelint-enable */
`;

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: `calc(100% - ${2*theme.spacing.unit}px)`,
  },
});


export class Home extends React.PureComponent {
  
  state = {
    adjustingTrain: {
      train: "",
      time: 0,
    },
  }
  
  static propTypes = {
    classes: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    availableStations: PropTypes.array.isRequired,
    selectedStations: PropTypes.object.isRequired,
  };

  handleToggleStation = (evt, selected) => {
    const { dispatch } = this.props;
    dispatch(selectStation(evt.target.value, selected));
  };

  handleReverseStationOrder = (evt) => {
    const { dispatch } = this.props;
    dispatch(reverseStationOrder());
  };
  
  handleClickLeg = (leg) => {
    this.setState({ ...this.state, adjustingTrain: {train: leg.train, time: leg.trainInitialDeparture } });
  }
  
  dismissAdjustingTrain = () => {
    this.setState({ ...this.state, adjustingTrain: {train: "", time: 0 } });
  }

  setNewTrainTime = () => {
    const { dispatch } = this.props;
    dispatch(changeTrainDepartureTime(this.state.adjustingTrain.train, this.state.adjustingTrain.time));
    this.setState({ ...this.state, adjustingTrain: {train: "", time: 0 } });
  }

  render() {
    
    return (
      <HomeContainer verticalPadding>
        <Heading>Stratetris</Heading>
        {
          this.props.fetchingTrains ?
          (
            <Button
              animate={this.props.fetchingTrains}
              size="xl"
              textTransform="uppercase"
              data-testid="Login"
            >
              <Text ml={2}>Running traffic allocator</Text>
            </Button>
          )
          : 
          (
            <Grid container>
              <Grid item xs={12} md={1}>
                <Button variant="primary" color="primary" onClick={this.handleReverseStationOrder}>
                  Reverse order
                </Button>

                <FormGroup>
                  {
                    this.props.availableStations.map((name) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={this.props.selectedStations[name]}
                            onChange={this.handleToggleStation}
                            value={name}
                          />
                        }
                        key={name}
                        label={name}
                      />
                    ))
                  }
                </FormGroup>

              </Grid>
              <Grid item xs={12} md={11}>
                <Projection 
                  legs={this.props.legs} 
                  stations={filter(this.props.availableStations, (station) => this.props.selectedStations[station])}
                  onClickLeg={this.handleClickLeg}/>
              </Grid>
            </Grid>
          )
        }
        <Dialog onClose={this.dismissAdjustingTrain} aria-labelledby="simple-dialog-title" open={this.state.adjustingTrain.train !== ""}>
          <DialogTitle id="simple-dialog-title">Adjust train departure time</DialogTitle>
          <p>
            <TextField
              id="standard-number"
              label="Train"
              value={this.state.adjustingTrain.train}
              onChange={(evt) => {}}
              className={this.props.classes.textField}
              InputLabelProps={{shrink: true, }}
              disabled
              margin="normal"/>
          </p>
          <p>
            <TextField
              id="standard-number"
              label="Time"
              value={this.state.adjustingTrain.time}
              onChange={(evt) => this.setState({ ...this.state, adjustingTrain: { ...this.state.adjustingTrain, time: evt.target.value}})}
              type="number"
              className={this.props.classes.textField}
              InputLabelProps={{shrink: true, }}
              margin="normal"/>
          </p>
          <p>
            <Button variant="primary" color="primary" onClick={this.setNewTrainTime} style={{margin: "0 5px 0 10px" }}>
              Save
            </Button>
            <Button variant="secondary" color="secondary" onClick={this.dismissAdjustingTrain} style={{margin: "0 5px 0 5px" }}>
              Discard
            </Button>
          </p>
        </Dialog>
      </HomeContainer>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return { 
    availableStations: state.projection.availableStations,
    selectedStations: state.projection.selectedStations,
    legs: state.projection.legs,
    fetchingTrains: state.projection.fetchingTrains,
  };
}

export default connect(mapStateToProps)(withStyles(styles)(Home));

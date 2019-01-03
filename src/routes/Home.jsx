import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { reverseStationOrder, selectStation } from 'actions/index';

import { Button, Container, Text, utils } from 'styled-minimal';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';

import { filter } from 'lodash';

import Projection from 'components/Projection'

const { spacer } = utils;

const HomeContainer = styled(Container)`
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
  font-size: 3.5rem;
  line-height: 1.4;
  margin-bottom: ${spacer(3)};
  margin-top: 0;
  text-align: center;

  /* stylelint-disable */
  ${utils.responsive({
    lg: `
      font-size: 4rem;
    `,
  })};
  /* stylelint-enable */
`;

export class Home extends React.PureComponent {
  static propTypes = {
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
                <Button variant="primary" color="primary" onClick={this.handleReverseStationOrder}>
                  Reverse order
                </Button>

              </Grid>
              <Grid item xs={12} md={11}>
                <Projection legs={this.props.legs} stations={filter(this.props.availableStations, (station) => this.props.selectedStations[station])} />
              </Grid>
            </Grid>
          )
        }
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

export default connect(mapStateToProps)(Home);

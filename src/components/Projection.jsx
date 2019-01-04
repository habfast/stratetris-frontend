import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import theme from 'modules/theme';
import { withStyles } from '@material-ui/core/styles';

import { utils } from 'styled-minimal';
import Icon from 'components/Icon';

const { colors, palette } = utils.themeGet(theme);

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';


const styles = theme => ({
  tooltipPaper: {
    ...theme.mixins.gutters(),
    marginTop: -theme.spacing.unit*2,
    marginLeft: theme.spacing.unit*2,
    marginRight: theme.spacing.unit*2,
    paddingTop: theme.spacing.unit*2,
    paddingBottom: theme.spacing.unit*2,
    position: 'absolute',
    left: 30, 
  },
});


export class Projection extends React.PureComponent {
    state = {
        zoomLevel: 0, // 0 to 1600: 0 = no zoom, 1600 = 24x zoom
        zoomPosition: 0, // 0 to 1380, represents minutes relative to start
        legTooltip: undefined,
    };
    
    hours = Array.apply(null, {length: 25}).map(Number.call, Number);
    
    highjackScroll = (event) => {
        event.preventDefault();
        
        if (event.ctrlKey) {
            const zoomLevel = Math.min(1600, Math.max(0, this.state.zoomLevel + (event.deltaY + event.deltaX)));
            this.setState({ ...this.state, zoomLevel });
        } else {
            const zoomPosition = Math.min(1380, Math.max(0, this.state.zoomPosition + ((event.deltaY + event.deltaX) / (this.state.zoomLevel+1) * 140)));
            this.setState({ ...this.state, zoomPosition });
        }
    };
    
    occupancyColor(occupancy) {
        if (occupancy < 0) occupancy = 0;
        if (occupancy > 1) occupancy = 1;
        //return `#${parseInt(occupancy * 256).toString(16)}${parseInt((1-occupancy) * 256).toString(16)}00`;
        if (occupancy > 0.5) {
            return `#FF${parseInt((1.0 - occupancy) * 512).toString(16).padStart(2, '0')}00`;
        } else {
            return `#${parseInt(occupancy * 512).toString(16).padStart(2, '0')}FF00`;
        }
    }

    capacityWidth(capacity) {
        return capacity / 200;
    }
    
    toDayTime(minute) {
        return `${parseInt(minute/60).toString(10)}h${(parseInt(minute)%60).toString(10).padStart(2, '0')}`;
    }
    
    render() {
        const width = 1440;
        const height = 700;
        const padding = 50;
        const totalWidth = width + 2*padding;
        const totalHeight = height + 2*padding;
        const { legs, stations, classes } = this.props;
        const { zoomLevel, zoomPosition, legTooltip } = this.state;

        if (stations.length < 2) {
            return (
                <div style={{paddingBottom: `${totalHeight/totalWidth*100}%`, width: '100%', height: 0, position: "relative"}}>
                    <svg viewBox={`0 0 ${width+padding*2} ${height+padding*2}`}  width="auto" height="auto" style={{position: "absolute"}} />
                </div>
            );
        }
    
        const stationCoords = {};
        let i = 0;
        for (let station of stations) {
            stationCoords[station] = (padding + height / (stations.length - 1) * i) / totalHeight * 100;
            i++;
        }
        
        function stopCoord(minute) {
            const zoomFactor = zoomLevel / 70 + 1; // 1 to 24, 1 = no zoom, 24 = show only one hour
            const zoomShift = (zoomPosition - zoomPosition / zoomFactor);
            return `${(padding + (minute - zoomShift) * zoomFactor) / totalWidth * 100}%`;
        }
        
        const oneHourWidth = stopCoord(zoomPosition + 60);

        return (
            <div>
        <div style={{paddingBottom: `${totalHeight/totalWidth*100}%`, width: '100%', height: 0, position: "relative"}}>
            <svg viewBox={`0 0 ${width+padding*2} ${height+padding*2}`}  width="auto" height="auto" style={{position: "absolute"}} onWheel={this.highjackScroll}>
                {
                    this.hours.map((hour) => {
                        const hourCoord = stopCoord(hour*60);
                        return (<g key={hour.toString(10)}>
                            <rect x={hourCoord} y={padding} width={oneHourWidth}  height={height}  fill={hour % 2 == 0 ? '#eeeeee' : '#f4f4f4'}/>
                            <text y={padding + height + 20} x={hourCoord}>{hour}:00</text>
                        </g>)
                    })
                }
                {
                    legs.map((leg) => (<g key={`${leg.train}-${leg.startStation}-lines`}>
                        <line 
                            y1={`${stationCoords[leg.startStation]}%`}
                            y2={`${stationCoords[leg.endStation]}%`} 
                            x1={stopCoord(leg.startTime)} 
                            x2={stopCoord(leg.endTime)} 
                            onMouseEnter={() => this.setState({...this.state, legTooltip: leg})}
                            onMouseLeave={() => this.setState({...this.state, legTooltip: undefined})}
                            onClick={() => this.props.onClickLeg(leg)}
                            stroke={this.occupancyColor(leg.occupancy)} 
                            strokeWidth={this.capacityWidth(leg.capacity)}>
                        </line>
                    </g>))
                }
                {
                    stations.map((station) => (<g key={station}>
                        <line y1={`${stationCoords[station]}%`} y2={`${stationCoords[station]}%`} x1={0} x2="100%" stroke="lightskyblue" strokeWidth={2} />
                        <text y={`${stationCoords[station]}%`} x={10}>{station}</text>
                    </g>))
                }
                {
                    legs.map((leg) => (<g key={`${leg.train}-${leg.startStation}-stations`}>
                        <circle cy={`${stationCoords[leg.startStation]}%`} cx={stopCoord(leg.startTime)} r={3}  />
                        <circle cy={`${stationCoords[leg.endStation]}%`} cx={stopCoord(leg.endTime)} r={3}  />
                    </g>))
                }
            </svg>
            {
                legTooltip && (
                  <Paper elevation={1} className={classes.tooltipPaper}>
                    <Typography component="p">
                      Train { legTooltip.train } <br />
                      leaves { legTooltip.startStation } at { this.toDayTime(legTooltip.startTime) }<br />
                      arrives { legTooltip.endStation } at { this.toDayTime(legTooltip.endTime) }<br />
                      Occupancy: { parseInt(legTooltip.capacity * legTooltip.occupancy) } - Capacity: { legTooltip.capacity } ({parseInt(legTooltip.occupancy * 100)}%)<br/>
                    </Typography>
                  </Paper>
                )
            }

            </div>
        </div>
        );
    }
    
};


Projection.propTypes = {
  legs: PropTypes.array.isRequired,
  stations: PropTypes.array.isRequired,
  onClickLeg: PropTypes.func,
};

export default withStyles(styles)(Projection);

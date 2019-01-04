import { handleActions } from 'redux-actions';
import immutable from 'immutability-helper';
import { REHYDRATE } from 'redux-persist/lib/constants';

import { ActionTypes } from 'constants/index';

import { keyBy, mapValues, intersection, clone, isEqual } from 'lodash';


function computeLegs(state) {
  const allLegs = [];
  
  const selectedStationsInOrder = [];
  for (const station of state.availableStations) {
    if (state.selectedStations[station]) {
      selectedStationsInOrder.push(station);
    }
  }

  for (let train of state.trains) {
    
    const itinerary = intersection(selectedStationsInOrder, train.itinerary);
    const reverse_itinerary = intersection(train.itinerary, selectedStationsInOrder);
    
    if (itinerary.length < 2 || !isEqual(itinerary, reverse_itinerary)) {
      continue;
    }
    
    for (let i = 0; i < itinerary.length - 1; i++) {
      const startStation = itinerary[i];
      const endStation = itinerary[i+1];
      let occupancy = 0, foundFirstStation=false;
      for (let j = 0; j < train.itinerary.length; j++) {
        if (train.itinerary[j] == endStation) {
          break;
        } else if (train.itinerary[j] == startStation) {
          foundFirstStation = true;
        } else if (!foundFirstStation) {
          continue;
        }
        let leg_occupancy = train.leg_occupancy[`${train.itinerary[j]}-${train.itinerary[j+1]}`];
        if (leg_occupancy > occupancy) {
          occupancy = leg_occupancy;
        }
      }
      allLegs.push({
        train: train.number,
        trainInitialDeparture: train.schedule[`${train.itinerary[0]}-dep`],
        startTime: (train.schedule[`${startStation}-arr`] + train.schedule[`${startStation}-dep`]) / 2,
        endTime: (train.schedule[`${endStation}-arr`] + train.schedule[`${endStation}-dep`]) / 2,
        startStation,
        endStation,
        occupancy: occupancy / train.capacity,
        capacity: train.capacity,
      });
    }
  }
  
  return allLegs;
}

export const projectionState = {
  pendingModifications: {},
  selectedStations: {},
  availableStations: [],
  legs: [],
  fetchingTrains: true,
  trains: [],
};

export default {
  projection: handleActions(
    {
      [ActionTypes.SELECT_STATION]: (state, { payload }) => {
        let cloned = clone(state);
        cloned.selectedStations = clone(cloned.selectedStations);
        cloned.selectedStations[payload.station] = payload.selected;
        return immutable(cloned, {
          legs: { $set: computeLegs(cloned) },
        })
      },
      [ActionTypes.REVERSE_STATION_ORDER]: (state) => {
        let cloned = clone(state);
        cloned.availableStations = clone(state.availableStations).reverse();
        return immutable(cloned, {
          legs: { $set: computeLegs(cloned) },
        })
      },
      [ActionTypes.CHANGE_TRAIN_DEPARTURE_TIME]: (state) => {
        return immutable(state, {
          fetchingTrains: { $set: true },
        })
      },
      [ActionTypes.LIST_STATIONS_SUCCESS]: (state, { payload }) => {
        return immutable(state, {
          availableStations: { $set: payload.data },
          selectedStations: { $set: mapValues(keyBy(payload.data), () => false) },
        })
      },
      [ActionTypes.LIST_TRAINS]: (state, { payload }) => {
        return immutable(state, {
          fetchingTrains: { $set: true },
        })
      },
      [ActionTypes.LIST_TRAINS_SUCCESS]: (state, { payload }) => {
        let cloned = clone(state);
        cloned.trains = payload.data;
        return immutable(state, {
          trains: { $set: payload.data },
          fetchingTrains: { $set: false },
          legs: { $set: computeLegs(cloned) },
        })
      },
      [ActionTypes.LIST_TRAINS_ERROR]: (state, { payload }) => {
        return immutable(state, {
          fetchingTrains: { $set: false },
        })
      },
    },
    projectionState,
  ),
};

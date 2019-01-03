// @flow
/**
 * @module Actions/App
 * @desc App Actions
 */

import uuid from 'uuid/v4';
import { createActions } from 'redux-actions';

import { ActionTypes } from 'constants/index';

export { goBack, go, push, replace } from 'modules/history';

export const { hideAlert, showAlert, switchMenu, listStations, listStationsSuccess, listTrains, listTrainsSuccess, selectStation, reverseStationOrder } = createActions({
  [ActionTypes.SWITCH_MENU]: (query: string) => ({ query }),
  [ActionTypes.HIDE_ALERT]: (id: string) => ({ id }),
  [ActionTypes.SHOW_ALERT]: (message: string, options: Object) => {
    const timeout = options.variant === 'danger' ? 0 : 5;

    return {
      id: options.id || uuid(),
      icon: options.icon,
      message,
      position: options.position || 'bottom-right',
      variant: options.variant || 'dark',
      timeout: typeof options.timeout === 'number' ? options.timeout : timeout,
    };
  },
  [ActionTypes.SELECT_STATION]: (station, selected) => ({ station, selected }),
  [ActionTypes.REVERSE_STATION_ORDER]: () => ({}),
  [ActionTypes.LIST_STATIONS]: () => ({}),
  [ActionTypes.LIST_STATIONS_SUCCESS]: (data: Object) => ({ data }),
  [ActionTypes.LIST_STATIONS_ERROR]: (message: string) => {
    return {
    };
  },
  [ActionTypes.LIST_TRAINS]: () => ({}),
  [ActionTypes.LIST_TRAINS_SUCCESS]: (data: Object) => ({ data }),
  [ActionTypes.LIST_TRAINS_ERROR]: (message: string) => {
    return {
    };
  },
});

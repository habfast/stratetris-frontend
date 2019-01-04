import keyMirror from 'fbjs/lib/keyMirror';

/**
 * @namespace Constants
 * @desc App constants
 */

/**
 * @constant {Object} ActionTypes
 * @memberof Constants
 */
export const ActionTypes = keyMirror({
  SWITCH_MENU: undefined,
  EXCEPTION: undefined,
  SHOW_ALERT: undefined,
  HIDE_ALERT: undefined,

  SELECT_STATION: undefined,
  LIST_STATIONS: undefined,
  LIST_STATIONS_SUCCESS: undefined,
  LIST_STATIONS_ERROR: undefined,
  REVERSE_STATION_ORDER: undefined,

  CHANGE_TRAIN_DEPARTURE_TIME: undefined,
  LIST_TRAINS: undefined,
  LIST_TRAINS_SUCCESS: undefined,
  LIST_TRAINS_ERROR: undefined,
});

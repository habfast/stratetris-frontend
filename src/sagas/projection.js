/**
 * @module Sagas/GitHub
 * @desc GitHub
 */

import { all, call, put, takeLatest } from 'redux-saga/effects';
import { request } from 'modules/client';

import { ActionTypes } from 'constants/index';

/**
 * Get Repos
 *
 * @param {Object} action
 *
 */
export function* getStations() {
  try {
    const response = yield call(
      request,
      `/api/all_stations/`,
    );
    yield put({
      type: ActionTypes.LIST_STATIONS_SUCCESS,
      payload: { data: JSON.parse(response) },
    });
  } catch (err) {
    /* istanbul ignore next */
    yield put({
      type: ActionTypes.LIST_STATIONS_ERROR,
      payload: err,
    });
  }
}


export function* getTrains() {
  try {
    const skipCompute = false;
    if (!skipCompute) {
      yield call(request, "/api/run_traffic_allocator/");
    }
    const response = yield call(
      request,
      `/api/train_list/`,
    );
    yield put({
      type: ActionTypes.LIST_TRAINS_SUCCESS,
      payload: { data: JSON.parse(response) },
    });
  } catch (err) {
    /* istanbul ignore next */
    yield put({
      type: ActionTypes.LIST_TRAINS_ERROR,
      payload: err,
    });
  }
}

export function* updateTrainDepartureTime({ payload }) {
  try {
    yield call(
      request, 
      "/api/rerun_allocator_new_schedule/",
      {
        method: 'POST',
        payload: JSON.stringify({ [payload.train]: parseInt(payload.time) }),
      }
      );
    const response = yield call(
      request,
      `/api/train_list/`,
    );
    yield put({
      type: ActionTypes.LIST_TRAINS_SUCCESS,
      payload: { data: JSON.parse(response) },
    });
  } catch (err) {
    /* istanbul ignore next */
    debugger;
    yield put({
      type: ActionTypes.LIST_TRAINS_ERROR,
      payload: err,
    });
  }
}

/**
 * GitHub Sagas
 */
export default function* root() {
  yield call(getStations);
  yield call(getTrains);
  yield all([takeLatest(ActionTypes.CHANGE_TRAIN_DEPARTURE_TIME, updateTrainDepartureTime)]);
}

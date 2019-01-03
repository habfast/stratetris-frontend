import { all, fork } from 'redux-saga/effects';

import app from './app';
import projection from './projection';

/**
 * rootSaga
 */
export default function* root() {
  yield all([fork(app), fork(projection)]);
}

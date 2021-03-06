import URI from 'urijs';
import API, { globalMockMode } from '../../../../../../../../common/API';
import {
  FETCH_V2V_SOURCE_DATASTORES,
  FETCH_V2V_TARGET_DATASTORES
} from './MappingWizardDatastoresStepConstants';
import {
  requestSourceDatastoresData,
  requestTargetDatastoresData
} from './mappingWizardDatastoresStep.fixtures';

const mockMode = globalMockMode;

const _filterSourceDatastores = response => {
  const { data } = response;
  if (data.storages) {
    return {
      sourceDatastores: data.storages
    };
  }
  return {
    sourceDatastores: []
  };
};

const _getSourceDatastoresActionCreator = (url, id) => dispatch => {
  dispatch({
    type: FETCH_V2V_SOURCE_DATASTORES,
    payload: new Promise((resolve, reject) => {
      API.get(url)
        .then(response => {
          resolve(_filterSourceDatastores(response));
        })
        .catch(e => {
          if (mockMode) {
            // to enable UI development without the backend ready, i'm catching the error
            // and passing some mock data thru the FULFILLED action after the REJECTED action is finished.
            return dispatch({
              type: `${FETCH_V2V_SOURCE_DATASTORES}_FULFILLED`,
              payload: _filterSourceDatastores(
                requestSourceDatastoresData(id).response
              )
            });
          }
          return reject(e);
        });
    })
  });
};

export const fetchSourceDatastoresAction = (url, id) => {
  const uri = new URI(`${url}/${id}`);
  // creates url like: http://localhost:3000/api/clusters/1?attributes=storages
  uri.addSearch({ attributes: 'storages' });

  return _getSourceDatastoresActionCreator(uri.toString(), id);
};

const _filterTargetDatastores = response => {
  const { data } = response;
  if (data.storages) {
    return {
      targetDatastores: data.storages
    };
  }
  return {
    targetDatastores: []
  };
};

const _getTargetDatastoresActionCreator = (url, id) => dispatch => {
  dispatch({
    type: FETCH_V2V_TARGET_DATASTORES,
    payload: new Promise((resolve, reject) => {
      API.get(url)
        .then(response => {
          resolve(_filterTargetDatastores(response));
        })
        .catch(e => {
          if (mockMode) {
            return dispatch({
              type: `${FETCH_V2V_TARGET_DATASTORES}_FULFILLED`,
              payload: _filterTargetDatastores(
                requestTargetDatastoresData(id).response
              )
            });
          }
          return reject(e);
        });
    })
  });
};

export const fetchTargetDatastoresAction = (url, id) => {
  const uri = new URI(`${url}/${id}`);
  // creates url like: http://localhost:3000/api/clusters/1?attributes=storages
  uri.addSearch({ attributes: 'storages' });

  return _getTargetDatastoresActionCreator(uri.toString(), id);
};

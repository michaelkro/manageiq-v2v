import { connect } from 'react-redux';

import MigrationsInProgressCard from './MigrationsInProgressCard';
import reducer from './MigrationsInProgressReducer';
import * as MigrationsInProgressActions from './MigrationsInProgressActions';
import { migrationsInProgressOverviewFilter } from './MigrationsInProgressSelectors';

export const reducers = { migrationsInProgress: reducer };

const mapStateToProps = ({ migrationsInProgress, overview }, ownProps) => {
  const selectedOverview = migrationsInProgressOverviewFilter(overview);
  return {
    ...migrationsInProgress,
    ...selectedOverview,
    ...ownProps.data
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) =>
  Object.assign(stateProps, ownProps.data, dispatchProps);

export default connect(
  mapStateToProps,
  MigrationsInProgressActions,
  mergeProps
)(MigrationsInProgressCard);

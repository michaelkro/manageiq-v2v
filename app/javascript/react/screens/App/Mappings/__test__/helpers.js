import uuid from 'uuid/v4';

import {
  TRANSFORMATION_MAPPING_ITEM_SOURCE_TYPES,
  TRANSFORMATION_MAPPING_ITEM_DESTINATION_TYPES
} from '../screens/MappingWizard/MappingWizardConstants';

export const generateMappingItem = (targetProvider, type, source_id, destination_id) => ({
  source_id: source_id || uuid(),
  source_type: TRANSFORMATION_MAPPING_ITEM_SOURCE_TYPES[type],
  destination_id: destination_id || uuid(),
  destination_type: TRANSFORMATION_MAPPING_ITEM_DESTINATION_TYPES[targetProvider][type]
});

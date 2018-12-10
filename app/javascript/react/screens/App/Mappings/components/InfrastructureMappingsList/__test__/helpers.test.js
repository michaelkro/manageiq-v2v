import { getMappingType, getHeaderText } from '../helpers';
import { generateMappingItem } from '../../../__test__/helpers';

const osp_mapping_items = [
  generateMappingItem('openstack', 'cluster'),
  generateMappingItem('openstack', 'datastore'),
  generateMappingItem('openstack', 'network')
];

const rhv_mapping_items = [
  generateMappingItem('rhevm', 'cluster'),
  generateMappingItem('rhevm', 'datastore'),
  generateMappingItem('rhevm', 'network')
];

describe('getMappingType', () => {
  test('detects OSP mappings', () => {
    expect(getMappingType(osp_mapping_items)).toBe('openstack');
  });

  test('detects RHV mappings', () => {
    expect(getMappingType(rhv_mapping_items)).toBe('rhevm');
  });
});

describe('getHeaderText', () => {
  test('formats header text for OSP mappings', () => {
    expect(getHeaderText(osp_mapping_items)).toMatchSnapshot();
  });

  test('formats header text for RHV mappings', () => {
    expect(getHeaderText(rhv_mapping_items)).toMatchSnapshot();
  });
});

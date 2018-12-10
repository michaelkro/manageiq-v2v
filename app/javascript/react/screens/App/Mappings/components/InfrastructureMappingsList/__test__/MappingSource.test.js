import React from 'react';
import { shallow } from 'enzyme';

import MappingSource from '../components/MappingSource';

test('renders MappingSource with children', () => {
  const wrapper = shallow(
    <MappingSource>
      <div>hello</div>
    </MappingSource>
  );

  expect(wrapper).toMatchSnapshot();
});

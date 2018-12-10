import React from 'react';
import { shallow } from 'enzyme';

import MappingTarget from '../components/MappingTarget';

test('renders MappingTarget with children', () => {
  const wrapper = shallow(
    <MappingTarget>
      <div>hello</div>
    </MappingTarget>
  );

  expect(wrapper).toMatchSnapshot();
});

import React from 'react';
import { shallow, mount } from 'enzyme';

export function shallowApp(AppComponent, defaultData = '') {
  const wrapper = shallow(<AppComponent data={defaultData} onEdit={data => { wrapper.setProps({ data }); }} appContext={{}} />);
  return wrapper;
}

export function mountApp(AppComponent, defaultData = '') {
  const wrapper = mount(<AppComponent data={defaultData} onEdit={data => { wrapper.setProps({ data }); }} appContext={{}} />);
  return wrapper;
}

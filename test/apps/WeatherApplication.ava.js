import React from 'react';
import test from 'ava';
import 'whatwg-fetch';

import { shallow, mount } from 'enzyme';
import sinon from 'sinon';

import WeatherApplication from '../../src/apps/WeatherApplication';

function hasError(wrapper) {
  return wrapper.find('div').filterWhere(d => d.key() === 'error').text() !== '';
}

function getResult(wrapper) {
  return wrapper.find('div').filterWhere(d => d.key() === 'result').text();
}

function setCityAndSubmit(wrapper, city) {
  const text = wrapper.find('input').at(0);
  const button = wrapper.find('input').at(1);
  text.instance().value = city;
  button.simulate('click');
}

/** @test {WeatherApplication} */
test('WeatherApplication should render initial state if no data is given', t => {
  const wrapper = shallow(<WeatherApplication data="" onEdit={() => {}} appContext={{}} />);
  t.falsy(getResult(wrapper));
});

/** @test {WeatherApplication} */
test('WeatherApplication should render initial state if an empty yaml object is given', t => {
  const wrapper = shallow(<WeatherApplication data="{}" onEdit={() => {}} appContext={{}} />);
  t.falsy(getResult(wrapper));
});

/** @test {WeatherApplication#handleGetWeather} */
test('WeatherApplication should not get weather if city is not given', t => {
  /* eslint-disable no-undef */
  const fetch = sinon.stub(window, 'fetch');
  /* eslint-enable */
  fetch.callsFake(() => {
    t.fail('should not be called');
  });

  try {
    const wrapper = mount(<WeatherApplication data="" onEdit={() => {}} appContext={{}} />);
    t.falsy(getResult(wrapper));
    setCityAndSubmit(wrapper, '');
    t.false(hasError(wrapper));
    t.falsy(getResult(wrapper));
  } finally {
    fetch.restore();
  }
});

/** @test {WeatherApplication#handleGetWeather} */
test.cb('WeatherApplication should get weather for kawasaki', t => {
  let calls = 0;
  /* eslint-disable no-undef */
  const fetch = sinon.stub(window, 'fetch');
  fetch.callsFake(() => {
    calls += 1;
    return Promise.resolve(new window.Response('{"coord":{"lon":139.72,"lat":35.52},"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"},{"id":701,"main":"Mist","description":"mist","icon":"50d"}],"base":"stations","main":{"temp":14,"pressure":1017,"humidity":82,"temp_min":14,"temp_max":14},"visibility":10000,"wind":{"speed":9.3,"deg":330,"gust":14.9},"clouds":{"all":75},"dt":1508907900,"sys":{"type":1,"id":7619,"message":0.0189,"country":"JP","sunrise":1508878573,"sunset":1508918016},"id":1859642,"name":"Kawasaki","cod":200}', {
      status: 200,
      headers: {
        'Content-type': 'application/json',
      },
    }));
  });
  /* eslint-enable */

  try {
    const wrapper = mount(<WeatherApplication data="" onEdit={() => {}} appContext={{}} />);
    t.falsy(getResult(wrapper));
    setCityAndSubmit(wrapper, 'kawasaki');
    setImmediate(() => {
      t.false(hasError(wrapper));
      const result = getResult(wrapper);
      t.true(result.indexOf('City: Kawasaki, JP') >= 0);
      t.true(result.indexOf('Weather: Rain') >= 0);
      t.true(result.indexOf('Temperature: 14') >= 0);
      t.is(1, calls);
      t.end();
    });
  } finally {
    fetch.restore();
  }
});

/** @test {WeatherApplication#handleGetWeather} */
test.cb('WeatherApplication should display error when no API key is set', t => {
  let calls = 0;
  /* eslint-disable no-undef */
  const fetch = sinon.stub(window, 'fetch');
  fetch.callsFake(() => {
    calls += 1;
    return Promise.resolve(new window.Response('{"cod":401, "message": "Invalid API key. Please see http://openweathermap.org/faq#error401 for more info."}', {
      status: 200,
      headers: {
        'Content-type': 'application/json',
      },
    }));
  });
  /* eslint-enable */

  try {
    const wrapper = mount(<WeatherApplication data="" onEdit={() => {}} appContext={{}} />);
    t.falsy(getResult(wrapper));
    setCityAndSubmit(wrapper, 'kawasaki');
    setImmediate(() => {
      t.true(hasError(wrapper));
      t.is(1, calls);
      t.end();
    });
  } finally {
    fetch.restore();
  }
});

/** @test {WeatherApplication#handleGetWeather} */
test.cb('WeatherApplication should not get weather for nonexistant city', t => {
  let calls = 0;
  /* eslint-disable no-undef */
  const fetch = sinon.stub(window, 'fetch');
  fetch.callsFake(() => {
    calls += 1;
    return Promise.resolve(new window.Response('{"cod":"404","message":"city not found"}', {
      status: 200,
      headers: {
        'Content-type': 'application/json',
      },
    }));
  });
  /* eslint-enable */

  try {
    const wrapper = mount(<WeatherApplication data="" onEdit={() => {}} appContext={{}} />);
    t.falsy(getResult(wrapper));
    setCityAndSubmit(wrapper, 'city-that-does-not-exist');
    setImmediate(() => {
      t.true(hasError(wrapper));
      t.falsy(getResult(wrapper));
      t.is(1, calls);
      t.end();
    });
  } finally {
    fetch.restore();
  }
});

/** @test {WeatherApplication#handleGetWeather} */
test.cb('WeatherApplication should display error if there is an error on request', t => {
  let calls = 0;
  /* eslint-disable no-undef */
  const fetch = sinon.stub(window, 'fetch');
  fetch.callsFake(() => {
    calls += 1;
    return Promise.reject(new Error('reject'));
  });
  /* eslint-enable */

  try {
    const wrapper = mount(<WeatherApplication data="" onEdit={() => {}} appContext={{}} />);
    t.falsy(getResult(wrapper));
    setCityAndSubmit(wrapper, 'kawasaki');
    setImmediate(() => {
      t.true(hasError(wrapper));
      t.is(1, calls);
      t.end();
    });
  } finally {
    fetch.restore();
  }
});


/** @test {WeatherApplication#componentWillReceiveProps} */
test('WeatherApplication should be updated by props', t => {
  const wrapper = shallow(<WeatherApplication data="" onEdit={() => {}} appContext={{}} />);
  t.falsy(getResult(wrapper));
  const model = new WeatherApplication.Model();
  model.setWeather({
    sys: {
      country: 'JP',
    },
    name: 'Kawasaki',
    weather: [
      {
        main: 'Rain',
        icon: '10d',
      },
    ],
    main: {
      temp: 14,
    },
  });
  wrapper.setProps({ data: model.serialize() });
  t.truthy(getResult(wrapper));
});

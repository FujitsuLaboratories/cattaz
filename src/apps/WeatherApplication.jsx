import React from 'react';
import PropTypes from 'prop-types';
import Yaml from 'js-yaml';
import isEqual from 'lodash/isEqual';
// OpenWeatherMap [https://openweathermap.org/]
// Please change to your own OpenWeatherMap API KEY in [../apikey/apikey.js]
import { openWeatherMapApiKey } from '../apikey/apikey';

const baseURL = 'http://api.openweathermap.org/data/2.5/weather';
const units = 'metric';
const iconURL = 'http://openweathermap.org/img/w/';

class WeatherModel {
  constructor(country = '', city = '', weather = '', icon = '', temp = 0) {
    this.country = country;
    this.city = city;
    this.weather = weather;
    this.icon = icon;
    this.temp = temp;
  }

  equals(other) {
    return isEqual(this, other);
  }

  serialize() {
    return Yaml.safeDump(this);
  }

  static deserialize(str) {
    try {
      const obj = Yaml.safeLoad(str);
      const model = new WeatherModel();
      if (obj.country) model.country = obj.country;
      if (obj.city) model.city = obj.city;
      if (obj.weather) model.weather = obj.weather;
      if (obj.icon) model.icon = obj.icon;
      if (obj.temp) model.temp = obj.temp;
      return model;
    } catch (ex) {
      return new WeatherModel();
    }
  }
}

export default class WeatherApplication extends React.Component {
  constructor() {
    super();
    this.state = { errorMessage: '' };
    this.refInputCity = React.createRef();
    this.handleGetWeather = this.handleGetWeather.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { data } = this.props;
    if (!isEqual(this.state, nextState)) return true;
    if (data === nextProps.data) return false;
    const oldModel = WeatherModel.deserialize(data);
    const newModel = WeatherModel.deserialize(nextProps.data);
    return !oldModel.equals(newModel);
  }

  async handleGetWeather() {
    const city = this.refInputCity.current.value;
    if (!city) return;
    try {
      const response = await window.fetch(`${baseURL}?q=${city}&units=${units}&appid=${openWeatherMapApiKey}`);
      const data = await response.json();
      if (data.cod === 200) {
        const { onEdit, appContext } = this.props;
        const newWeather = new WeatherModel(data.sys.country, data.name, data.weather[0].main, data.weather[0].icon, data.main.temp);
        this.setState({ errorMessage: '' });
        onEdit(newWeather.serialize(), appContext);
      } else if (data.cod === 401) {
        this.setState({ errorMessage: `Get Weather Error [ ${data.message} Please change to your own OpenWeatherMap API KEY in [../apikey/apikey.js].]` });
      } else {
        this.setState({ errorMessage: `Get Weather Error [ ${data.message} ]` });
      }
    } catch (e) {
      this.setState({ errorMessage: `Get Weather Error [ ${e} ]` });
    }
  }

  render() {
    const { data } = this.props;
    const { errorMessage } = this.state;
    const weather = WeatherModel.deserialize(data);
    return (
      <div>
        <input ref={this.refInputCity} type="text" placeholder="Add City" />
        <input type="button" value="Get Current Weather" onClick={this.handleGetWeather} />
        <div key="error" style={{ color: '#D8000C' }}>
          {errorMessage}
        </div>
        <div key="result">
          { weather.city ? [
            `City: ${weather.city}, ${weather.country}`,
            <br />,
            `Weather: ${weather.weather}`,
            <img src={`${iconURL}${weather.icon}.png`} alt={weather.weather} width="24px" />,
            `Temperature: ${weather.temp}℃`,
          ] : null }
        </div>
      </div>
    );
  }
}

WeatherApplication.Model = WeatherModel;

WeatherApplication.propTypes = {
  data: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  appContext: PropTypes.shape({}).isRequired,
};

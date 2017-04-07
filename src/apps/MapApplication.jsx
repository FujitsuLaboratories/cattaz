import React from 'react';
// Please change to your own Google Maps API KEY in ../apikey/apikey.js
import { googlemapsApiKey } from '../apikey/apikey';

const initCoordinate = { lat: 35.698601, lng: 139.773139 };

class MapModel {
  constructor() {
    this.lat = initCoordinate.lat;
    this.lng = initCoordinate.lng;
  }
  setCoordinate(latlng) {
    this.lat = latlng.lat;
    this.lng = latlng.lng;
  }
  serialize() {
    return JSON.stringify(this, null, 2);
  }
  static deserialize(str) {
    try {
      const obj = JSON.parse(str);
      const model = new MapModel();
      model.lat = obj.lat;
      model.lng = obj.lng;
      return model;
    } catch (ex) {
      return new MapModel();
    }
  }
}

export default class MapApplication extends React.Component {
  constructor(props) {
    super();
    this.handleSearchPlace = this.handleSearchPlace.bind(this);
    this.handleGetMap = this.handleGetMap.bind(this);
    // this.msgHandler = this.msgHandler.bind(this);
    this.state = { map: MapModel.deserialize(props.data) };
  }
  componentDidMount() {
    // window.addEventListener('message', this.msgHandler);
    const doc = this.iframe.contentWindow.document;
    doc.open();
    doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Map</title>
        <meta name="viewport" content="initial-scale=1.0">
        <meta charset="utf-8">
        <style>
          #map {
            height: 100%;
          }
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <div id="disp" style="color: #c66900;"></div>
        <div id="error" style="color: #ba000d;"></div>
        <div id="map"></div>
        <script>
          var map;
          var marker;
          var latlng = { lat: ${this.state.map.lat}, lng: ${this.state.map.lng}};
          var oldLatlng = { lat: ${this.state.map.lat}, lng: ${this.state.map.lng}}; 
          function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
              center: new google.maps.LatLng(latlng),
              zoom: 16
            });
            marker = new google.maps.Marker({
              map: map,
              position: new google.maps.LatLng(latlng)
            });
            /*
            google.maps.event.addListener(map, 'drag', dragMap);
            function dragMap(){
              var latlngFunc = map.getCenter();
              latlng.lat = latlngFunc.lat();
              latlng.lng = latlngFunc.lng();
            }
            */
            google.maps.event.addListener(map, 'click', clickMap);
            function clickMap(event){
              map.panTo(event.latLng);
              marker.position = event.latLng;
              marker.setMap(map);
              latlng.lat = event.latLng.lat();
              latlng.lng = event.latLng.lng();
              if(latlng.lat !== oldLatlng.lat || latlng.lng !== oldLatlng.lng){
                document.getElementById('disp').innerHTML = "Marker Changed";
              }
            }
            function receiveMessage(event) {
              if(event.origin === window.location.origin) {
                if (event.data.type === 'setCoordinate') {
                  map.panTo(new google.maps.LatLng(event.data.value));
                  marker.position = new google.maps.LatLng(event.data.value);
                  marker.setMap(map);
                } else if(event.data.type === 'searchPlace') {
                  var geocoder = new google.maps.Geocoder();
                  geocoder.geocode({ 'address': event.data.value }, function(results, status) {                    
                    if (status === google.maps.GeocoderStatus.OK) {
                      document.getElementById('error').innerHTML = '';
                      map.panTo(results[0].geometry.location);
                      marker.position = results[0].geometry.location;
                      marker.setMap(map);
                      latlng.lat = results[0].geometry.location.lat();
                      latlng.lng = results[0].geometry.location.lng();
                      if(latlng.lat !== oldLatlng.lat || latlng.lng !== oldLatlng.lng){
                        document.getElementById('disp').innerHTML = "Marker Changed";
                      }
                      // event.source.postMessage({ type: 'getCoordinate', value: latlng, status: true }, event.origin);
                    } else {
                      document.getElementById('error').innerHTML = 'Google Maps Error: ' + status;
                      // event.source.postMessage({ type: 'getCoordinate', value: 0, status: false }, event.origin);
                    } 
                  });
                } else if(event.data.type === 'getMapNotification') {
                  oldLatlng.lat = latlng.lat;
                  oldLatlng.lng = latlng.lng;
                  document.getElementById('disp').innerHTML = "";
                }
              }
            }
            window.addEventListener('message', receiveMessage);
          }
        </script>
        <script src="https://maps.googleapis.com/maps/api/js?key=${googlemapsApiKey}&callback=initMap" async defer></script>
      </body>
    </html>
    `);
    doc.close();
  }
  componentWillReceiveProps(newProps) {
    const newMap = MapModel.deserialize(newProps.data);
    this.setState({ map: newMap });
    this.iframe.contentWindow.postMessage({ type: 'setCoordinate', value: newMap }, window.location.origin);
  }
  shouldComponentUpdate(/* newProps, nextState */) {
    // TODO
    return true;
  }
  /*
  msgHandler(event) {
    if (event.origin === window.location.origin) {
      if (event.data.type === 'getCoordinate') {
        if (event.data.status) {
          this.state.map.setCoordinate(event.data.value);
          this.props.onEdit(this.state.map.serialize(), this.props.appContext);
        } else {
          console.log('search place error');
        }
      }
    }
  }
  */
  handleSearchPlace() {
    const address = this.inputPlace.value;
    if (!address) return;
    this.iframe.contentWindow.postMessage({ type: 'searchPlace', value: address }, window.location.origin);
  }
  handleGetMap() {
    this.iframe.contentWindow.postMessage({ type: 'getMapNotification' }, window.location.origin);
    this.state.map.setCoordinate(this.iframe.contentWindow.latlng);
    this.props.onEdit(this.state.map.serialize(), this.props.appContext);
  }
  render() {
    let apiKeyErrorMessage = '';
    if (!googlemapsApiKey) {
      apiKeyErrorMessage = 'No API KEY. Please change to your own Google Maps API KEY in [../apikey/apikey.js].';
    }
    return (<div>
      <div>
        <div style={{ color: '#ba000d' }}>{apiKeyErrorMessage}</div>
        <input ref={(input) => { this.inputPlace = input; }} type="text" placeholder="Add Place" />
        <input type="button" value="Search" onClick={this.handleSearchPlace} />
        <input type="button" value="Get Marker" onClick={this.handleGetMap} />
      </div>
      <iframe ref={(input) => { this.iframe = input; }} width="400" height="400" frameBorder="0" marginHeight="0" marginWidth="0" scrolling="no">
        <p>Your browser does not support iframes.</p>
      </iframe>
      <div style={{ color: '#D8000C' }}>{this.state.errorMessage}</div>
    </div>
    );
  }
}

MapApplication.propTypes = {
  data: React.PropTypes.string.isRequired,
  onEdit: React.PropTypes.func.isRequired,
  appContext: React.PropTypes.shape({}).isRequired,
};

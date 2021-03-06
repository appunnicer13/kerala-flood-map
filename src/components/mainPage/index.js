import React from "react";

import MainPageMap from "./mainPageMap";
import { isValidCoords, returnCoord, returnPosition } from "./utils";
import { getDistance } from "geolib";
import { SelectDistance } from "../partials/select_distance";

class MainPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      position: null,
      markers: [],
      distance_filter_selected: 10
    };

    this.render = this.render.bind(this);
    this.locateMe = this.locateMe.bind(this);
    this.onLocateMe = this.onLocateMe.bind(this);
    this.onChangeDistance = this.onChangeDistance.bind(this);
  }

  async componentDidMount() {
    const resp = await fetch("/data");
    const markers = await resp.json();

    this.setState({ all_markers: markers });
  }

  componentDidUpdate(prevProps, prevState) {
    const new_filter = this.state.distance_filter_selected;
    const old_filter = prevState.distance_filter_selected;
    if (new_filter !== old_filter) {
      this.locateMe();
    }
  }

  onChangeDistance(event) {
    this.setState({ distance_filter_selected: parseInt(event.target.value) });
  }

  onLocateMe(navigator_position) {
    if (this.state.all_markers instanceof Array) {
      if (
        navigator_position instanceof Array &&
        navigator_position.length === 2
      ) {
        const position = returnPosition(navigator_position);
        const filtered_markers = this.state.all_markers.filter(marker => {
          if (isValidCoords(marker.latlng)) {
            const distance = getDistance(
              position,
              returnPosition(returnCoord(marker.latlng))
            );

            return distance <= this.state.distance_filter_selected * 1000;
          }
          return false;
        });

        this.setState({
          position: navigator_position,
          markers: filtered_markers
        });
      } else {
        console.log("Give your location first");
      }
    } else {
      console.log("Data is still being loaded, try again");
    }
  }

  locateMe() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        const navigator_position = [
          position.coords.latitude,
          position.coords.longitude
        ];
        this.onLocateMe(navigator_position);
      });
    } else {
      alert("Error Getting Your Location");
    }
  }

  render() {
    return (
      <div>
        <div className="flex items-center justify-between pl3 pr3">
          <h3 className="">Kerala Flood Map</h3>
          <div>
            <SelectDistance
              onChangeDistance={this.onChangeDistance}
              distance_selected={this.state.distance_filter_selected}
            />

            <button
              onClick={this.locateMe}
              className="link black ba pa2 mr2 br2"
            >
              Near Me
            </button>

            <a
              href="https://keralarescue.in/request/"
              target="blank"
              className="link bg-black white pa2 br2"
            >
              Request
            </a>
          </div>
        </div>
        <div className="flex items-center pl3">
          <p className="f6 mr2">Red: Needs Rescue</p>
          <p className="f6 mh2">Green: Request Made For Other</p>
          <p className="f6 mh2">Blue: Generic Request</p>
        </div>
        <MainPageMap
          position={this.state.position || [10, 76]}
          zoomLevel={this.state.position === null ? 7 : 13}
          markers={this.state.markers}
        />
      </div>
    );
  }
}

export default MainPage;

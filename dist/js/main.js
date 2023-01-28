import { setLocationObject, getHomeLocation, getWeatherFromCoords, getCoordsFromAPI, cleanInput } from "./dataFunctions.js";
import { setPlaceholderText, addSpinner, displayError, displayAPIError, updateScreenReaderConfirmation, updateDisplay } from "./domFunctions.js"
import currentLocation from "./currentLocation.js";
const currentLoc = new currentLocation();

const initApp = () => {
  // Adding listeners
  const geoButton = document.getElementById("getLocation");
  geoButton.addEventListener("click", getGeoWeather)
  const homeButton = document.getElementById("home");
  homeButton.addEventListener("click", loadWeather);
  const saveButton = document.getElementById("saveLocation");
  saveButton.addEventListener("click", saveLocation);
  const unitButton = document.getElementById("measurementUnit");
  unitButton.addEventListener("click", setUnitPref);
  const refreshButton = document.getElementById("refresh");
  refreshButton.addEventListener("click", refreshWeather);
  const locationInput = document.getElementById("searchBar_form");
  locationInput.addEventListener("submit", submitLocInput);
  // Set up
  setPlaceholderText();
  // Load the weather
  loadWeather();
};

document.addEventListener("DOMContentLoaded", initApp);

const getGeoWeather = (event) => {
  if (event) {
    if (event.type === "click") {
      const mapIcon = document.querySelector(".fa-map-marker-alt");
      addSpinner(mapIcon);
    }
  }

  if (!navigator.geolocation) return geoError();
  navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
};

const geoError = (errObj) => {
  const errMsg = errObj ? errObj.message : "Geolocation is not supported";
  displayError(errMsg, errMsg);
};

const geoSuccess = (position) => {
  const coordsObj = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
    name: `Lat:${position.coords.latitude} Long:${position.coords.longitude}`
  };
  // Set location object
  setLocationObject(currentLoc, coordsObj);
  // Update data and view
  updateDataAndDisplay(currentLoc);
};

const loadWeather = (event) => {
  const defaultLocation = getHomeLocation();
  if (!defaultLocation && !event) return getGeoWeather();
  if (!defaultLocation && event.type === "click") {
    displayError("No default location saved", "Please save a default location");
  } else if (defaultLocation && !event) {
    displayDefaultLocationWeather(defaultLocation);
  } else {
    const homeIcon = document.querySelector(".fa-house");
    addSpinner(homeIcon);
    displayDefaultLocationWeather(defaultLocation);
  }
};

const displayDefaultLocationWeather = (home) => {
  if (typeof home === "string") {
    const locationJson = JSON.parse(home);
    const coordsObj = {
      lat: locationJson.lat,
      lon: locationJson.lon,
      name: locationJson.name,
      unit: locationJson.unit
    };
    setLocationObject(currentLoc, coordsObj);
    updateDataAndDisplay(currentLoc);
  }
};

const saveLocation = () => {
  if (currentLoc.getLat() && currentLoc.getLon()) {
    const saveIcon = document.querySelector(".fa-save")
    addSpinner(saveIcon)
    const location = {
      name: currentLoc.getName(),
      lat: currentLoc.getLat(),
      lon: currentLoc.getLon(),
      unit: currentLoc.getUnit(),
    };
    localStorage.setItem("defaultWeatherLocation", JSON.stringify(location));
    updateScreenReaderConfirmation(`Saved ${currentLoc.getName()} as default location`)
  }
};

const setUnitPref = () => {
  const unitIcon = document.querySelector(".fa-ruler");
  addSpinner(unitIcon);
  currentLoc.toggleUnit();
  updateDataAndDisplay(currentLoc);
};

const refreshWeather = () => {
  const refreshIcon = document.querySelector(".fa-sync-alt");
  addSpinner(refreshIcon);
  updateDataAndDisplay(currentLoc);
};

const submitLocInput = async (event) => {
  event.preventDefault();
  const text = document.getElementById("searchBar_text").value;
  const textInput = cleanInput(text);
  if (!textInput.length) return;

  const locationIcon = document.querySelector(".fa-magnifying-glass-location");
  addSpinner(locationIcon); 
  const coordsData = await getCoordsFromAPI(textInput, currentLoc.getUnit());
  // Connect with API data
  if (coordsData) {
    if (coordsData.cod === 200) {
    // Success
    const coordsObj = {
      lat: coordsData.coord.lat,
      lon: coordsData.coord.lon,
      name: coordsData.sys.country ? `${coordsData.name}, ${coordsData.sys.country}` : coordsData.name
    };
    setLocationObject(currentLoc, coordsObj);
    updateDataAndDisplay(currentLoc);
    } else {
    displayAPIError(coordsData);
    }
  } else {
    displayError("API Connection Error", "API Connection Error")
  }
  
};

const updateDataAndDisplay = async (locationObj) => {
  const weatherJson = await getWeatherFromCoords(locationObj);
  if (weatherJson) updateDisplay(weatherJson, locationObj);
};


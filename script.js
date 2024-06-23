/** @type {google.maps.Map} */
let map;
/** @type {google.maps.Marker[]} */
let markers = [];
/** @type {{ lat: number, lng: number }} */
let selectedLocation;

/** Default locations to be initially displayed on the map */
const defaultLocations = [
  { name: "Tbilisi", lat: 41.7151, lng: 44.8271 },
  { name: "Kutaisi", lat: 42.2679, lng: 42.6946 },
  { name: "Batumi", lat: 41.6168, lng: 41.6367 },
];

/** Google Maps layers */
let trafficLayer;
let transitLayer;
/** Google Maps Street View */
let streetViewService;
let streetViewPanorama;

/** Function to initialize the map and its functionalities */
const initMap = () => {
  const initialCenter = { lat: 42.3154, lng: 43.3569 };
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 7,
    center: initialCenter,
    streetViewControl: false,
  });
  initializeLayers();
  initializeStreetView();
  loadMarkersFromDefaultLocations();
  loadMarkersFromSavedLocations();
  trafficLayer = new google.maps.TrafficLayer();
  transitLayer = new google.maps.TransitLayer();

  // Event listener for placing markers on map click
  map.addListener("click", (event) => {
    placeMarker(event.latLng, true);
  });
  setupPegmanControl();
  setupSaveButton();
};

/** Initializes traffic and transit layers */
const initializeLayers = () => {
  trafficLayer = new google.maps.TrafficLayer();
  transitLayer = new google.maps.TransitLayer();
};

// Function to toggle traffic layer
const toggleTrafficLayer = () => {
  if (trafficLayer.getMap()) {
    trafficLayer.setMap(null);
  } else {
    trafficLayer.setMap(map);
  }
};

// Function to toggle transit layer
const toggleTransitLayer = () => {
  if (transitLayer.getMap()) {
    transitLayer.setMap(null);
  } else {
    transitLayer.setMap(map);
  }
};

// Example: Assume you have two buttons for toggling traffic and transit layers
document.getElementById("toggle-traffic").addEventListener("click", toggleTrafficLayer);
document.getElementById("toggle-transit").addEventListener("click", toggleTransitLayer);

/** Initializes Street View service and panorama */
const initializeStreetView = () => {
  streetViewService = new google.maps.StreetViewService();
  streetViewPanorama = new google.maps.StreetViewPanorama(
    document.getElementById("street-view"),
    { visible: false }
  );
  map.setStreetView(streetViewPanorama);
};

/** Loads markers from default locations onto the map */
const loadMarkersFromDefaultLocations = () => {
  defaultLocations.forEach((location) => {
    placeMarker(new google.maps.LatLng(location.lat, location.lng), false);
  });
};

/** Loads markers from saved locations (cookies) onto the map */
const loadMarkersFromSavedLocations = () => {
  const savedLocations = getLocationsFromCookies();
  savedLocations.forEach((location) => {
    placeMarker(new google.maps.LatLng(location.lat, location.lng), false);
  });
};

/**
 * Places a marker on the map at the specified location.
 * @param {google.maps.LatLng} location - The location to place the marker
 * @param {boolean} addToCookie - Whether to add the location to cookies
 */
const placeMarker = (location, addToCookie) => {
  const marker = new google.maps.Marker({
    position: location,
    map: map,
  });
  markers.push(marker);

  selectedLocation = { lat: location.lat(), lng: location.lng() };

  if (addToCookie) {
    saveLocationToCookies(selectedLocation);
  }
};

/**
 * Saves a location to browser cookies.
 * @param {{ lat: number, lng: number }} location - The location to save
 */
const saveLocationToCookies = (location) => {
  const savedLocations = getLocationsFromCookies();
  savedLocations.push(location);
  document.cookie = `locations=${JSON.stringify(savedLocations)}; path=/;`;
};

/**
 * Retrieves locations from browser cookies.
 * @returns {Array<{ lat: number, lng: number }>} Array of saved locations
 */
const getLocationsFromCookies = () => {
  const cookieString = document.cookie
    .split("; ")
    .find((row) => row.startsWith("locations="));
  return cookieString ? JSON.parse(cookieString.split("=")[1]) : [];
};

/** Sets up the Pegman control for Street View */
const setupPegmanControl = () => {
  const pegmanControlDiv = document.createElement("div");
  createPegmanControl(pegmanControlDiv);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(pegmanControlDiv);
};

/**
 * Creates the Pegman control UI.
 * @param {HTMLElement} controlDiv - The div element to contain the control
 */
const createPegmanControl = (controlDiv) => {
  const controlUI = document.createElement("div");
  controlUI.style.backgroundColor = "#fff";
  controlUI.style.border = "2px solid #fff";
  controlUI.style.borderRadius = "3px";
  controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  controlUI.style.cursor = "pointer";
  controlUI.style.margin = "10px";
  controlUI.style.textAlign = "center";
  controlUI.title = "Drag Pegman to view Street View";
  controlDiv.appendChild(controlUI);
  const controlText = document.createElement("div");
  controlText.style.color = "rgb(25,25,25)";
  controlText.style.fontFamily = "Roboto,Arial,sans-serif";
  controlText.style.fontSize = "16px";
  controlText.style.lineHeight = "38px";
  controlText.style.paddingLeft = "5px";
  controlText.style.paddingRight = "5px";
  controlText.innerHTML = "Pegman";
  controlUI.appendChild(controlText);
  const pegmanIcon = document.createElement("img");
  pegmanIcon.src =
    "https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-2x.png";
  pegmanIcon.style.width = "38px";
  pegmanIcon.style.height = "38px";
  controlUI.appendChild(pegmanIcon);
  // Event listener for Pegman control click
  controlUI.addEventListener("click", () => {
    const pegman = new google.maps.Marker({
      position: map.getCenter(),
      map: map,
      draggable: true,
      icon: {
        url: "https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-2x.png",
        size: new google.maps.Size(22, 22),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(11, 11),
      },
    });
    // Event listener for Pegman drag end event
    google.maps.event.addListener(pegman, "dragend", (event) => {
      const location = event.latLng;
      streetViewService.getPanorama(
        { location: location, radius: 50 },
        processSVData
      );
    });
  });
};

/** Sets up Save button functionality */
const setupSaveButton = () => {
  document.getElementById("save-btn").addEventListener("click", () => {
    if (selectedLocation) {
      const jsonData = JSON.stringify(selectedLocation, null, 2);
      downloadJSON(jsonData, "data.json");
    } else {
      alert("Please select a location on the map first.");
    }
  });
};

/**
 * Processes Street View data.
 * @param {Object} data - Street View data
 * @param {google.maps.StreetViewStatus} status - Status of the request
 */
const processSVData = (data, status) => {
  if (status === google.maps.StreetViewStatus.OK) {
    streetViewPanorama.setPosition(data.location.latLng);
    streetViewPanorama.setVisible(true);
  } else {
    alert("Street View data not found for this location.");
  }
};

/**
 * Downloads JSON data as a file.
 * @param {string} jsonData - JSON data to download
 * @param {string} filename - Filename for the downloaded file
 */
const downloadJSON = (jsonData, filename) => {
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

window.onload = initMap;

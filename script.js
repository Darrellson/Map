let map;
let markers = [];
let selectedLocation;

const defaultLocations = [
  { name: "Tbilisi", lat: 41.7151, lng: 44.8271 },
  { name: "Kutaisi", lat: 42.2679, lng: 42.6946 },
  { name: "Batumi", lat: 41.6168, lng: 41.6367 },
];

let trafficLayer;
let transitLayer;
let streetViewService;
let streetViewPanorama;

const initMap = () => {
  const initialCenter = { lat: 41.7, lng: 43.5 };
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 4,
    center: initialCenter,
    streetViewControl: false,
    restriction: {
      latLngBounds: {
        north: 43.8,
        south: 41.0,
        east: 47.0,
        west: 39.0,
      },
      strictBounds: true,
    },
  });

  initializeLayers();
  initializeStreetView();
  loadMarkersFromDefaultLocations();
  loadMarkersFromSavedLocations();
  setupControls();

  // Debugging: Log zoom level to console to check if it's set correctly
  console.log("Current Zoom Level:", map.getZoom());
};


const initializeLayers = () => {
  trafficLayer = new google.maps.TrafficLayer();
  transitLayer = new google.maps.TransitLayer();
};

const toggleTrafficLayer = () => {
  if (trafficLayer.getMap()) {
    trafficLayer.setMap(null);
  } else {
    trafficLayer.setMap(map);
  }
};

const toggleTransitLayer = () => {
  if (transitLayer.getMap()) {
    transitLayer.setMap(null);
  } else {
    transitLayer.setMap(map);
  }
};

const setupControls = () => {
  const trafficControl = document.getElementById("toggle-traffic");
  const transitControl = document.getElementById("toggle-transit");
  const pegmanControl = document.getElementById("pegman");
  const saveButton = document.getElementById("save-btn");

  trafficControl.addEventListener("click", toggleTrafficLayer);
  transitControl.addEventListener("click", toggleTransitLayer);
  pegmanControl.addEventListener("click", toggleStreetView);
  saveButton.addEventListener("click", saveLocation);
};

const initializeStreetView = () => {
  streetViewService = new google.maps.StreetViewService();
  streetViewPanorama = new google.maps.StreetViewPanorama(
    document.getElementById("map"),
    {
      visible: false,
      position: map.getCenter(),
    }
  );
  map.setStreetView(streetViewPanorama);
};

const toggleStreetView = () => {
  const toggle = streetViewPanorama.getVisible() ? false : true;
  streetViewPanorama.setVisible(toggle);
};

const loadMarkersFromDefaultLocations = () => {
  defaultLocations.forEach((location) => {
    placeMarker(new google.maps.LatLng(location.lat, location.lng), false);
  });
};

const loadMarkersFromSavedLocations = () => {
  const savedLocations = getLocationsFromCookies();
  savedLocations.forEach((location) => {
    placeMarker(new google.maps.LatLng(location.lat, location.lng), false);
  });
};

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

const saveLocation = () => {
  if (selectedLocation) {
    const jsonData = JSON.stringify(selectedLocation, null, 2);
    downloadJSON(jsonData, "location.json");
  } else {
    alert("Please select a location on the map first.");
  }
};

const downloadJSON = (jsonData, filename) => {
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const getLocationsFromCookies = () => {
  const cookieString = document.cookie
    .split("; ")
    .find((row) => row.startsWith("locations="));
  return cookieString ? JSON.parse(cookieString.split("=")[1]) : [];
};

window.onload = initMap;

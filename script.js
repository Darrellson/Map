let map, panorama, trafficLayer, transitLayer;

/**
 * Defines the geographical bounds of Georgia (country).
 */
const georgiaBounds = {
  north: 44.0,
  south: 41.0,
  east: 49.0,
  west: 38.0,
};

/**
 * Defines the default locations (markers) in Georgia.
 */
const defaultLocations = [
  { lat: 41.7151, lng: 44.8271, title: "Tbilisi" },
  { lat: 42.2679, lng: 42.718, title: "Kutaisi" },
  { lat: 41.6168, lng: 41.6367, title: "Batumi" },
];

/**
 * Initializes the Google Map and sets it up with various layers and controls.
 */
const initMap = () => {
  // Initialize map centered on Georgia (country) with restrictions to stay within its bounds
  map = new google.maps.Map(document.getElementById("map"), {
    mapTypeId: "roadmap",
    streetViewControl: false,
    restriction: {
      latLngBounds: georgiaBounds,
      strictBounds: true,
    },
  });

  // Fit the map to the bounds of Georgia to ensure the entire country is visible
  const bounds = new google.maps.LatLngBounds(
    { lat: georgiaBounds.south, lng: georgiaBounds.west },
    { lat: georgiaBounds.north, lng: georgiaBounds.east }
  );
  map.fitBounds(bounds);

  // Initialize Street View for the map, initially not visible
  panorama = new google.maps.StreetViewPanorama(document.getElementById("map"), {
    position: { lat: 41.7151, lng: 44.8271 },
    pov: { heading: 165, pitch: 0 },
    visible: false,
  });
  map.setStreetView(panorama);

  // Initialize Traffic Layer
  trafficLayer = new google.maps.TrafficLayer();

  // Initialize Transit Layer
  transitLayer = new google.maps.TransitLayer();

  // Add event listener for toggling the Traffic Layer
  document.getElementById("traffic-toggle").addEventListener("click", () => {
    if (trafficLayer.getMap()) {
      trafficLayer.setMap(null);
    } else {
      trafficLayer.setMap(map);
    }
  });

  // Add event listener for toggling the Transit Layer
  document.getElementById("transit-toggle").addEventListener("click", () => {
    if (transitLayer.getMap()) {
      transitLayer.setMap(null);
    } else {
      transitLayer.setMap(map);
    }
  });

  // Add event listener for toggling the Street View
  document.getElementById("streetview-toggle").addEventListener("click", () => {
    panorama.setVisible(!panorama.getVisible());
  });

  // Add event listener for toggling the Satellite View
  document.getElementById("satellite-toggle").addEventListener("click", () => {
    if (map.getMapTypeId() === "satellite") {
      map.setMapTypeId("roadmap");
    } else {
      map.setMapTypeId("satellite");
    }
  });

  // Add default markers to the map
  addDefaultMarkers();

  // Add click event listener to the map for adding new markers
  map.addListener("click", (event) => {
    addMarker(event.latLng);
    saveMarker(event.latLng);
  });

  // Load saved markers from cookies and display them on the map
  loadSavedMarkers();
};

/**
 * Adds default markers to the map at predefined locations.
 */
const addDefaultMarkers = () => {
  defaultLocations.forEach((location) => {
    new google.maps.Marker({
      position: location,
      map: map,
      title: location.title,
    });
  });
};

/**
 * Adds a marker to the map at the specified location.
 * @param {google.maps.LatLng} location - The location to place the marker.
 */
const addMarker = (location) => {
  new google.maps.Marker({
    position: location,
    map: map,
  });
};

/**
 * Saves a marker location to cookies.
 * @param {google.maps.LatLng} location - The location to save.
 */
const saveMarker = (location) => {
  let markers = getSavedMarkers();
  markers.push(location);
  document.cookie = `markers=${JSON.stringify(markers)};path=/;max-age=31536000`;
};

/**
 * Retrieves saved marker locations from cookies.
 * @returns {Array} - An array of saved marker locations.
 */
const getSavedMarkers = () => {
  let cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    let [name, value] = cookie.split("=");
    if (name.trim() === "markers") {
      return JSON.parse(value);
    }
  }
  return [];
};

/**
 * Loads saved markers from cookies and adds them to the map.
 */
const loadSavedMarkers = () => {
  let markers = getSavedMarkers();
  markers.forEach((location) => {
    addMarker(location);
  });
};

// Load the map when the window finishes loading
window.onload = initMap;

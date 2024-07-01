let map, panorama, trafficLayer, transitLayer;

/**
 * Geographic bounds for Georgia.
 */
const georgiaBounds = {
  north: 44.0,
  south: 41.0,
  east: 49.0,
  west: 38.0,
};

/**
 * Default locations for markers in Georgia.
 */
const defaultLocations = [
  { lat: 41.7151, lng: 44.8271, title: "Tbilisi" },
  { lat: 42.2679, lng: 42.718, title: "Kutaisi" },
  { lat: 41.6168, lng: 41.6367, title: "Batumi" },
];

/**
 * Initializes the Google Map and its components.
 */
const initMap = () => {
  // Initialize the map with specified options
  map = new google.maps.Map(document.getElementById("map"), {
    mapTypeId: "roadmap",
    streetViewControl: false,
    restriction: {
      latLngBounds: georgiaBounds,
      strictBounds: true,
    },
  });

  // Set the map bounds to Georgia
  const bounds = new google.maps.LatLngBounds(
    { lat: georgiaBounds.south, lng: georgiaBounds.west },
    { lat: georgiaBounds.north, lng: georgiaBounds.east }
  );
  map.fitBounds(bounds);

  // Initialize the Street View Panorama
  panorama = new google.maps.StreetViewPanorama(
    document.getElementById("map"),
    {
      position: { lat: 41.7151, lng: 44.8271 },
      pov: { heading: 165, pitch: 0 },
      visible: false,
    }
  );
  map.setStreetView(panorama);

  // Initialize traffic and transit layers
  trafficLayer = new google.maps.TrafficLayer();
  transitLayer = new google.maps.TransitLayer();

  // Map type buttons configuration
  const mapTypeButtons = [
    { id: "roadmap", type: "roadmap" },
    { id: "satellite", type: "satellite" },
    { id: "terrain", type: "terrain" },
  ];

  // Add event listeners for map type buttons
  mapTypeButtons.forEach(({ id, type }) => {
    document
      .getElementById(id)
      .addEventListener("click", () => map.setMapTypeId(type));
  });

  // Add event listeners for traffic and transit toggles
  document
    .getElementById("traffic-toggle")
    .addEventListener("click", toggleLayer(trafficLayer));
  document
    .getElementById("transit-toggle")
    .addEventListener("click", toggleLayer(transitLayer));

  // Add event listener for Street View toggle
  document.getElementById("streetview-toggle").addEventListener("click", () => {
    panorama.setVisible(!panorama.getVisible());
  });

  // Add default markers to the map
  addDefaultMarkers();

  // Add a click event listener to the map to add and save markers
  map.addListener("click", (event) => {
    addMarker(event.latLng);
    saveMarker(event.latLng);
  });

  // Load saved markers from cookies
  loadSavedMarkers();
};

/**
 * Adds default markers to the map based on predefined locations.
 */
const addDefaultMarkers = () => {
  defaultLocations.forEach(({ lat, lng, title }) => {
    new google.maps.Marker({
      position: { lat, lng },
      map,
      title,
    });
  });
};

/**
 * Adds a marker to the map at the specified location.
 * @param {google.maps.LatLng} location - The location where the marker will be placed.
 */
const addMarker = (location) => {
  new google.maps.Marker({ position: location, map });
};

/**
 * Saves a marker's location to cookies.
 * @param {google.maps.LatLng} location - The location of the marker to be saved.
 */
const saveMarker = (location) => {
  const markers = getSavedMarkers();
  markers.push(location);
  document.cookie = `markers=${JSON.stringify(
    markers
  )};path=/;max-age=31536000`;
};

/**
 * Retrieves saved markers from cookies.
 * @returns {Array} An array of saved marker locations.
 */
const getSavedMarkers = () => {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
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
  getSavedMarkers().forEach(addMarker);
};

/**
 * Toggles the visibility of a map layer (traffic or transit).
 * @param {google.maps.Layer} layer - The layer to be toggled.
 * @returns {Function} A function to toggle the layer.
 */
const toggleLayer = (layer) => () => {
  layer.setMap(layer.getMap() ? null : map);
};

// Initialize the map when the window loads
window.onload = initMap;

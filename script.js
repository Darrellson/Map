let map, trafficLayer, transitLayer;

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
 * Initializes the Google Map and its components.
 */
const initMap = () => {
  // Initialize the map with specified options
  map = new google.maps.Map(document.getElementById("map"), {
    mapTypeId: "roadmap",
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
    document.getElementById(id).addEventListener("click", () => map.setMapTypeId(type));
  });

  // Add event listeners for traffic and transit toggles
  document.getElementById("traffic-toggle").addEventListener("click", toggleLayer(trafficLayer));
  document.getElementById("transit-toggle").addEventListener("click", toggleLayer(transitLayer));

  // Load saved markers from cookies
  loadSavedMarkersFromCookies();

  // Load locations from JSON file and add markers
  fetch("data.json")
    .then((response) => response.json())
    .then((locations) => {
      addMarkersFromLocations(locations);
    })
    .catch((error) => console.error("Error loading JSON locations:", error));

  // Add click event listener to the map for adding new markers
  map.addListener("click", (event) => {
    addMarker(event.latLng);
  });
};

/**
 * Adds markers from the specified locations to the map.
 * @param {Array} locations - Array of location objects with lat, lng, and title.
 */
const addMarkersFromLocations = (locations) => {
  const markers = [];
  locations.forEach((location) => {
    for (let i = 0; i < 50; i++) {
      const marker = {
        lat: location.lat + (Math.random() - 0.5) * 0.01, // Adding slight randomness to avoid exact overlaps
        lng: location.lng + (Math.random() - 0.5) * 0.01,
        title: location.title,
      };
      markers.push(marker);
      new google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map,
        title: marker.title,
      });
      console.log("Added marker at:", marker);
    }
  });
  saveMarkersToJSON(markers);
  saveMarkersToCookies(markers);
};

/**
 * Saves markers array to JSON format in localStorage.
 * @param {Array} markers - Array of marker locations.
 */
const saveMarkersToJSON = (markers) => {
  localStorage.setItem("markers", JSON.stringify(markers));
};

/**
 * Saves markers array to cookies.
 * @param {Array} markers - Array of marker locations.
 */
const saveMarkersToCookies = (markers) => {
  document.cookie = `markers=${encodeURIComponent(JSON.stringify(markers))};path=/`;
};

/**
 * Loads saved markers from cookies and adds them to the map.
 */
const loadSavedMarkersFromCookies = () => {
  const markers = getSavedMarkersFromCookies();
  markers.forEach((marker) => {
    new google.maps.Marker({ position: marker, map });
    console.log("Loaded marker from cookies at:", marker);
  });
};

/**
 * Retrieves saved markers from cookies.
 * @returns {Array} An array of saved marker locations.
 */
const getSavedMarkersFromCookies = () => {
  const cookies = document.cookie.split(';');
  const markersCookie = cookies.find(cookie => cookie.trim().startsWith('markers='));
  if (markersCookie) {
    const markersJSON = markersCookie.split('=')[1];
    return markersJSON ? JSON.parse(decodeURIComponent(markersJSON)) : [];
  }
  return [];
};

/**
 * Adds a marker at the specified location and saves it.
 * @param {Object} location - The location to place the marker.
 */
const addMarker = (location) => {
  const marker = new google.maps.Marker({
    position: location,
    map,
  });
  console.log("Added new marker at:", location);

  // Save marker to localStorage and cookies
  const markers = getSavedMarkersFromCookies();
  markers.push(location);
  saveMarkersToJSON(markers);
  saveMarkersToCookies(markers);
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

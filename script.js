// Define map, markers, and selectedLocation variables
let map;
let markers = [];
let selectedLocation;

// Default locations for Tbilisi, Kutaisi, and Batumi
const defaultLocations = [
  { name: "Tbilisi", lat: 41.7151, lng: 44.8271 },
  { name: "Kutaisi", lat: 42.2679, lng: 42.6946 },
  { name: "Batumi", lat: 41.6168, lng: 41.6367 }
];

/**
 * Initializes the Google Map on page load.
 * Sets up a click listener on the map to place markers.
 * Loads default locations and previously saved locations from cookies.
 */
const initMap = () => {
  // Initial center coordinates for the map
  const initialCenter = { lat: 42.3154, lng: 43.3569 };

  // Create a new Google Map instance
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 7,
    center: initialCenter,
  });

  // Load default locations
  defaultLocations.forEach(location => {
    placeMarker(new google.maps.LatLng(location.lat, location.lng), false);
  });

  // Load locations from cookies if any
  const savedLocations = getLocationsFromCookies();
  savedLocations.forEach(location => {
    placeMarker(new google.maps.LatLng(location.lat, location.lng), false);
  });

  // Add click listener to the map to place markers
  map.addListener("click", (event) => {
    placeMarker(event.latLng, true);
  });
};

/**
 * Places a marker on the map at the given location.
 * If addToCookie is true, saves the location to cookies.
 * @param {google.maps.LatLng} location - The location where the marker should be placed.
 * @param {boolean} addToCookie - Flag to determine if the location should be saved to cookies.
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
 * Saves a location to cookies.
 * @param {Object} location - The location object to be saved in cookies.
 */
const saveLocationToCookies = (location) => {
  const savedLocations = getLocationsFromCookies();
  savedLocations.push(location);
  document.cookie = `locations=${JSON.stringify(savedLocations)}; path=/; max-age=31536000`; // 1 year expiry
};

/**
 * Retrieves locations from cookies.
 * @returns {Array} - Array of location objects.
 */
const getLocationsFromCookies = () => {
  const cookieString = document.cookie.split('; ').find(row => row.startsWith('locations='));
  if (cookieString) {
    return JSON.parse(cookieString.split('=')[1]);
  }
  return [];
};

/**
 * Event listener for the "Save" button.
 * Checks if a location is selected and initiates the download of JSON data.
 */
document.getElementById("save-btn").addEventListener("click", () => {
  if (selectedLocation) {
    const jsonData = JSON.stringify(selectedLocation, null, 2);
    downloadJSON(jsonData, "data.json");
  } else {
    alert("Please select a location on the map first.");
  }
});

/**
 * Downloads JSON data as a file with the specified filename.
 * @param {string} jsonData - The JSON data to be downloaded.
 * @param {string} filename - The filename for the downloaded file.
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

// Initialize the map when the window loads
window.onload = initMap;

// Define map, marker, and selectedLocation variables
let map;
let marker;
let selectedLocation;

/**
 * Initializes the Google Map on page load.
 * Sets up a click listener on the map to place markers.
 */
const initMap = () => {
  // Initial center coordinates for the map
  const initialCenter = { lat: 42.3154, lng: 43.3569 };

  // Create a new Google Map instance
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 7,
    center: initialCenter,
  });

  // Add click listener to the map to place markers
  map.addListener("click", (event) => {
    placeMarker(event.latLng);
  });
};

/**
 * Places a marker on the map at the given location.
 * If a marker exists, moves it to the new location; otherwise, creates a new marker.
 * Updates the selectedLocation with the latitude and longitude of the marker.
 * @param {google.maps.LatLng} location - The location where the marker should be placed.
 */
const placeMarker = (location) => {
  if (marker) {
    marker.setPosition(location); // Move existing marker to new location
  } else {
    marker = new google.maps.Marker({
      // Create new marker
      position: location,
      map: map,
    });
  }
  selectedLocation = { lat: location.lat(), lng: location.lng() }; // Update selected location
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
  // Create a Blob object from the JSON data
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // Create a temporary <a> element to trigger the download
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";

  // Append <a> to the body and trigger the click event
  document.body.appendChild(a);
  a.click();

  // Clean up by removing the <a> element
  document.body.removeChild(a);
};

// Initialize the map when the window loads
window.onload = initMap;

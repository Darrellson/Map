// Define map, marker, and selectedLocation variables
let map: google.maps.Map | undefined;
let marker: google.maps.Marker | undefined;
let selectedLocation: google.maps.LatLngLiteral | undefined;

/**
 * Initializes the Google Map on page load.
 * Sets up a click listener on the map to place markers.
 * @param {T} CenterType - Type of the initial center coordinates.
 * @param {E} EventType - Type of the event object in the click listener.
 */
const initMap = <
  T extends google.maps.LatLngLiteral,
  E extends google.maps.MapMouseEvent
>(
  initialCenter: T
) => {
  // Create a new Google Map instance
  map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
    zoom: 7,
    center: initialCenter,
  });

  // Add click listener to the map to place markers
  map.addListener("click", (event: E) => {
    placeMarker(event.latLng);
  });
};

/**
 * Places a marker on the map at the given location.
 * If a marker exists, moves it to the new location; otherwise, creates a new marker.
 * Updates the selectedLocation with the latitude and longitude of the marker.
 * @param {google.maps.LatLng} location - The location where the marker should be placed.
 */
const placeMarker = <T extends google.maps.LatLng>(location: T) => {
  if (marker) {
    marker.setPosition(location); // Move existing marker to new location
  } else {
    marker = new google.maps.Marker({
      // Create new marker
      position: location,
      map: map!,
    });
  }
  selectedLocation = { lat: location.lat(), lng: location.lng() }; // Update selected location
};

/**
 * Event listener for the "Save" button.
 * Checks if a location is selected and initiates the download of JSON data.
 */
document.getElementById("save-btn")!.addEventListener("click", () => {
  if (selectedLocation) {
    const jsonData = { ...selectedLocation }; 
    downloadJSON(jsonData, "data.json");
  } else {
    alert("Please select a location on the map first.");
  }
});

/**
 * Downloads JSON data as a file with the specified filename.
 * @param {T} jsonData - The JSON data to be downloaded.
 * @param {string} filename - The filename for the downloaded file.
 */
const downloadJSON = <T>(jsonData: T, filename: string) => {
  const jsonDataString = JSON.stringify(jsonData, null, 2);

  // Create a Blob object from the JSON data
  const blob = new Blob([jsonDataString], { type: "application/json" });
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

// Example of initializing the map with specific initial center coordinates
const initialCenter: google.maps.LatLngLiteral = { lat: 42.3154, lng: 43.3569 };
initMap(initialCenter);

// Initialize the map when the window loads
window.onload = () => initMap(initialCenter); 

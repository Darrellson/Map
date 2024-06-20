let map;
let marker;
let selectedLocation;

const initMap = () => {
  const georgia = { lat: 42.3154, lng: 43.3569 };
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 7,
    center: georgia,
  });

  map.addListener("click", (event) => {
    placeMarker(event.latLng);
  });
};

const placeMarker = (location) => {
  if (marker) {
    marker.setPosition(location);
  } else {
    marker = new google.maps.Marker({
      position: location,
      map: map,
    });
  }
  selectedLocation = { lat: location.lat(), lng: location.lng() };
};

document.getElementById("save-btn").addEventListener("click", () => {
  if (selectedLocation) {
    const jsonData = JSON.stringify(selectedLocation, null, 2);
    downloadJSON(jsonData, "data.json");
  } else {
    alert("Please select a location on the map first.");
  }
});

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








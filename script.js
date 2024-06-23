let map;
let markers = [];
let selectedLocation;

const defaultLocations = [
  { name: "Tbilisi", lat: 41.7151, lng: 44.8271 },
  { name: "Kutaisi", lat: 42.2679, lng: 42.6946 },
  { name: "Batumi", lat: 41.6168, lng: 41.6367 }
];

let trafficLayer;
let transitLayer;

let streetViewService;
let streetViewPanorama;

const initMap = () => {
  const initialCenter = { lat: 42.3154, lng: 43.3569 };
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 7,
    center: initialCenter,
    streetViewControl: false
  });

  trafficLayer = new google.maps.TrafficLayer();
  transitLayer = new google.maps.TransitLayer();

  // Initialize Street View service and panorama
  streetViewService = new google.maps.StreetViewService();
  streetViewPanorama = new google.maps.StreetViewPanorama(
    document.getElementById("street-view"),
    { visible: false }
  );
  map.setStreetView(streetViewPanorama);

  // Add default markers
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

  // Add Pegman control
  const pegmanControlDiv = document.createElement("div");
  createPegmanControl(pegmanControlDiv);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(pegmanControlDiv);

  // Add Save button functionality
  document.getElementById("save-btn").addEventListener("click", () => {
    if (selectedLocation) {
      const jsonData = JSON.stringify(selectedLocation, null, 2);
      downloadJSON(jsonData, "data.json");
    } else {
      alert("Please select a location on the map first.");
    }
  });
};

const toggleLayer = (layer) => {
  if (layer.getMap()) {
    layer.setMap(null);
  } else {
    layer.setMap(map);
  }
};

const placeMarker = (location, addToCookie) => {
  const marker = new google.maps.Marker({
    position: location,
    map: map
  });
  markers.push(marker);

  selectedLocation = { lat: location.lat(), lng: location.lng() };

  if (addToCookie) {
    saveLocationToCookies(selectedLocation);
  }
};

const saveLocationToCookies = (location) => {
  const savedLocations = getLocationsFromCookies();
  savedLocations.push(location);
  document.cookie = `locations=${JSON.stringify(savedLocations)}; path=/; max-age=31536000`; // 1 year expiry
};

const getLocationsFromCookies = () => {
  const cookieString = document.cookie.split('; ').find(row => row.startsWith('locations='));
  return cookieString ? JSON.parse(cookieString.split('=')[1]) : [];
};

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
  pegmanIcon.src = "https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-2x.png";
  pegmanIcon.style.width = "38px";
  pegmanIcon.style.height = "38px";
  controlUI.appendChild(pegmanIcon);

  controlUI.addEventListener("click", () => {
    const pegman = new google.maps.Marker({
      position: map.getCenter(),
      map: map,
      draggable: true,
      icon: {
        url: "https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-2x.png",
        size: new google.maps.Size(22, 22),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(11, 11)
      }
    });

    google.maps.event.addListener(pegman, 'dragend', (event) => {
      const location = event.latLng;
      streetViewService.getPanorama({ location: location, radius: 50 }, processSVData);
    });
  });
};

const processSVData = (data, status) => {
  if (status === google.maps.StreetViewStatus.OK) {
    streetViewPanorama.setPosition(data.location.latLng);
    streetViewPanorama.setVisible(true);
  } else {
    alert('Street View data not found for this location.');
  }
};

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

let map, panorama, trafficLayer, transitLayer;

const georgiaBounds = {
  north: 44.0,
  south: 41.0,
  east: 49.0,
  west: 38.0,
};

const defaultLocations = [
  { lat: 41.7151, lng: 44.8271, title: "Tbilisi" },
  { lat: 42.2679, lng: 42.718, title: "Kutaisi" },
  { lat: 41.6168, lng: 41.6367, title: "Batumi" },
];

const initMap = () => {
  map = new google.maps.Map(document.getElementById("map"), {
    mapTypeId: "roadmap",
    streetViewControl: false,
    restriction: {
      latLngBounds: georgiaBounds,
      strictBounds: true,
    },
  });

  const bounds = new google.maps.LatLngBounds(
    { lat: georgiaBounds.south, lng: georgiaBounds.west },
    { lat: georgiaBounds.north, lng: georgiaBounds.east }
  );
  map.fitBounds(bounds);

  panorama = new google.maps.StreetViewPanorama(
    document.getElementById("map"),
    {
      position: { lat: 41.7151, lng: 44.8271 },
      pov: { heading: 165, pitch: 0 },
      visible: false,
    }
  );
  map.setStreetView(panorama);

  trafficLayer = new google.maps.TrafficLayer();
  transitLayer = new google.maps.TransitLayer();

  document.getElementById("roadmap").addEventListener("click", () => {
    map.setMapTypeId("roadmap");
  });

  document.getElementById("satellite").addEventListener("click", () => {
    map.setMapTypeId("satellite");
  });

  document.getElementById("terrain").addEventListener("click", () => {
    map.setMapTypeId("terrain");
  });

  document.getElementById("traffic-toggle").addEventListener("click", () => {
    if (trafficLayer.getMap()) {
      trafficLayer.setMap(null);
    } else {
      trafficLayer.setMap(map);
    }
  });

  document.getElementById("transit-toggle").addEventListener("click", () => {
    if (transitLayer.getMap()) {
      transitLayer.setMap(null);
    } else {
      transitLayer.setMap(map);
    }
  });

  document.getElementById("streetview-toggle").addEventListener("click", () => {
    panorama.setVisible(!panorama.getVisible());
  });

  addDefaultMarkers();

  map.addListener("click", (event) => {
    addMarker(event.latLng);
    saveMarker(event.latLng);
  });

  loadSavedMarkers();
};

const addDefaultMarkers = () => {
  defaultLocations.forEach((location) => {
    new google.maps.Marker({
      position: location,
      map: map,
      title: location.title,
    });
  });
};

const addMarker = (location) => {
  new google.maps.Marker({
    position: location,
    map: map,
  });
};

const saveMarker = (location) => {
  let markers = getSavedMarkers();
  markers.push(location);
  document.cookie = `markers=${JSON.stringify(
    markers
  )};path=/;max-age=31536000`;
};

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

const loadSavedMarkers = () => {
  let markers = getSavedMarkers();
  markers.forEach((location) => {
    addMarker(location);
  });
};

window.onload = initMap;

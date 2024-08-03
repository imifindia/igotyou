// scripts.js

mapboxgl.accessToken = 'pk.eyJ1IjoiaW1pZmluZGlhIiwiYSI6ImNsejhtM3J5dTAyZmwybHNkcjlrZzUyM2UifQ.EYhRAkvwwMyTz7X-CGmudA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [0, 0],
    zoom: 2
});

// Search control.
var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false
});
map.addControl(geocoder);

// Locate button.
var geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    showUserLocation: false,
    trackUserLocation: false
});
map.addControl(geolocate);
map.on('load', function () {
    map.resize();
    geolocate.trigger();
});

// Add compass and zoom controls
var navControl = new mapboxgl.NavigationControl({ showCompass: true });
map.addControl(navControl);

// Get the user's location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        var userMarker = new mapboxgl.Marker({ draggable: true })
            .setLngLat([lon, lat])
            .addTo(map);
        map.setCenter([lon, lat]);

        userMarker.on('dragend', function () {
            var lngLat = userMarker.getLngLat();
            document.getElementById('coords').value = `${lngLat.lng},${lngLat.lat}`;
        });

        geolocate.on('geolocate', (e) => {
            map.flyTo({ center: [e.coords.longitude, e.coords.latitude], zoom: 15 });
            userMarker.setLngLat([e.coords.longitude, e.coords.latitude])
            document.getElementById('coords').value = `${e.coords.longitude},${e.coords.latitude}`;
        });

        geocoder.on('result', function (e) {
            const coordinates = e.result.geometry.coordinates;
            userMarker.setLngLat(coordinates);
            map.flyTo({ center: coordinates, zoom: 15 });
            document.getElementById('coords').value = `${coordinates[0]},${coordinates[1]}`;
        });
    }, function () {
        alert('Unable to retrieve your location');
    });
} else {
    alert('Geolocation is not supported by your browser');
}

const helpCloseButtonhelpButton = document.getElementById('help-button');
helpCloseButtonhelpButton.addEventListener('click', () => {
    document.getElementById('map-container').style.display = 'none';
    document.getElementById('report-form').style.display = 'none';
    document.getElementById('help-section').style.display = 'block';
    document.getElementById('confirmation-screen').style.display = 'none';
});

const confirmLocationButton = document.getElementById('confirm-location-button');
confirmLocationButton.addEventListener('click', () => {
    document.getElementById('map-container').style.display = 'none';
    document.getElementById('report-form').style.display = 'block';
    document.getElementById('help-section').style.display = 'none';
    document.getElementById('confirmation-screen').style.display = 'none';
});

const backToMapButton = document.getElementById('back-to-map-button');
backToMapButton.addEventListener('click', () => {
    document.getElementById('map-container').style.display = 'block';
    document.getElementById('report-form').style.display = 'none';
    document.getElementById('help-section').style.display = 'none';
    document.getElementById('confirmation-screen').style.display = 'none';
});

const helpCloseButton = document.getElementById('help-close-button');
helpCloseButton.addEventListener('click', () => {
    document.getElementById('map-container').style.display = 'block';
    document.getElementById('report-form').style.display = 'none';
    document.getElementById('help-section').style.display = 'none';
    document.getElementById('confirmation-screen').style.display = 'none';
});

const submitButton = document.getElementById('submit');
submitButton.addEventListener('click', () => {


    document.getElementById('map-container').style.display = 'none';
    document.getElementById('report-form').style.display = 'none';
    document.getElementById('help-section').style.display = 'none';
    document.getElementById('confirmation-screen').style.display = 'block';
});

// Function to add a new person card.
function addPersonCard() {
    const personCard = document.createElement('div');
    personCard.className = 'card mb-3 person-card';
    personCard.innerHTML = `
      <div class="card-body">
        <div class="form-row">
          <div class="form-group col-md-6">
            <label for="name">Name</label>
            <input type="text" class="form-control" id="name" placeholder="Enter your name">
          </div>
          <div class="form-group col-md-6">
            <label for="nickname">Nickname</label>
            <input type="text" class="form-control" id="nickname" placeholder="Enter your nickname">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-md-6">
            <label for="family-name">Family name</label>
            <input type="text" class="form-control" id="family-name" placeholder="Enter your family name">
          </div>
          <div class="form-group col-md-6">
            <label for="contact-number">Contact number</label>
            <input type="tel" class="form-control" id="contact-number" placeholder="Enter your contact number">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-md-6">
            <label for="status">Status</label>
            <select class="form-control" id="status">
              <option>healthy</option>
              <option>disabled</option>
              <option>injured</option>
            </select>
          </div>
          <div class="form-group col-md-6">
            <label for="age">Age</label>
            <input type="number" class="form-control" id="age" placeholder="Enter your age">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-md-6">
            <label for="sex">Sex</label>
            <select class="form-control" id="sex">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div class="form-group col-md-6">
            <label for="place">Place</label>
            <input type="text" class="form-control" id="place" placeholder="Enter your location">
          </div>
        </div>
      </div>
    `;
    document.getElementById('people-container').appendChild(personCard);
}

// Event listener for the "Add more people" button
document.getElementById('add-person-btn').addEventListener('click', function (event) {
    event.preventDefault();
    addPersonCard();
});

addPersonCard();

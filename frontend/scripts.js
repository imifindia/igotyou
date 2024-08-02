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
    mapboxgl: mapboxgl
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
            map.setCenter([e.coords.longitude, e.coords.latitude]);
            userMarker.setLngLat([e.coords.longitude, e.coords.latitude])
            document.getElementById('coords').value = `${e.coords.longitude},${e.coords.latitude}`;
        });
    }, function () {
        alert('Unable to retrieve your location');
    });
} else {
    alert('Geolocation is not supported by your browser');
}

// Navigation related code.
const mapLink = document.getElementById('mapLink');
const reportLink = document.getElementById('reportLink');
const helpLink = document.getElementById('helpLink');
const links = [mapLink, reportLink, helpLink];

function setActiveLink(activeLink) {
    links.forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}
setActiveLink(mapLink);

function showMap() {
    document.getElementById('map').style.display = 'block';
    document.getElementById('report-form').style.display = 'none';
    document.getElementById('help-section').style.display = 'none';
    map.resize(); // Ensure the map resizes to fit the container
    setActiveLink(mapLink);
}

function showReportForm() {
    document.getElementById('map').style.display = 'none';
    document.getElementById('report-form').style.display = 'block';
    document.getElementById('help-section').style.display = 'none';
    setActiveLink(reportLink);
}

function showHelp() {
    document.getElementById('map').style.display = 'none';
    document.getElementById('report-form').style.display = 'none';
    document.getElementById('help-section').style.display = 'block';
    setActiveLink(helpLink);
}

mapLink.addEventListener('click', showMap);
reportLink.addEventListener('click', showReportForm);
helpLink.addEventListener('click', showHelp);

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
        <div class="form-group">
          <label for="file">File attachment</label>
          <input type="file" class="form-control-file" id="file">
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
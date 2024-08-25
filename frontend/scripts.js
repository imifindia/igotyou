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
    document.getElementById('coords').value = `${lat},${lon}`;

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

var handleStartAgainClick = () => {
  console.log('cli')
  document.getElementById('map-container').style.display = 'block';
  document.getElementById('report-form').style.display = 'none';
  document.getElementById('help-section').style.display = 'none';
  document.getElementById('confirmation-screen').style.display = 'none';
  document.getElementById('confirmation-message').innerHTML = '';
};

const submitButton = document.getElementById('submit');
submitButton.addEventListener('click', () => {
  // Collect data.
  var form = document.getElementById("report-form");
  var situation = document.querySelector("#situation").value;

  var reporterName = document.getElementById("reporter-name").value;
  var reporterPhone = document.getElementById("reporter-phone").value;
  var reporterRelation = document.getElementById("reporter-relation").value;

  var persons = Array.from(form.querySelectorAll("[data-person]")).map(person => ({
    name: person.querySelector("#name").value,
    nickname: person.querySelector("#nickname").value,
    familyName: person.querySelector("#family-name").value,
    contactNumber: person.querySelector("#contact-number").value,
    status: person.querySelector("#status").value,
    age: person.querySelector("#name").age,
    sex: person.querySelector("#name").sex,
    place: person.querySelector("#name").place,
  }));

  var kids = document.querySelector("#kids-below-10").value;
  var seniors = document.querySelector("#seniors-above-60").value;
  var otherAdults = document.querySelector("#other-adults").value;
  var notes = document.querySelector("#notes").value;

  var magic = document.querySelector("#magic").value;
  var coordinates = document.querySelector("#coords").value;

  console.log(situation.value, persons, kids, seniors, otherAdults, notes, magic, coordinates)

  document.getElementById('map-container').style.display = 'none';
  document.getElementById('report-form').style.display = 'none';
  document.getElementById('help-section').style.display = 'none';
  document.getElementById('confirmation-screen').style.display = 'block';

  // Form submission.
  var apiUrl = 'https://fie5mxoea4.execute-api.ap-south-1.amazonaws.com/prod';
  var apiKey = 'iRhRWA3DDk2nnFBVfMQjC5wKEZ1F875s7HBCP9pc';

  var requestBody = {
    situation,
    reporterName,
    reporterPhone,
    reporterRelation,
    persons,
    kids, seniors, otherAdults,
    notes,
    magic,
    coordinates
  };

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': `${apiKey}`,
      'origin': 'https://imifindia.github.io'
    },
    body: JSON.stringify(requestBody)

  }).then(response => {
    if (response.ok) {
      document.getElementById('confirmation-message').innerHTML = `
        <p>${i18next.t('report-submited')}</p>  
        <i class="fas fa-check text-success display-1"></i>
        <button class="btn btn-primary mt-5" id="start-again-button" onclick={handleStartAgainClick()}>
            <i class="fas fa-arrow-left mr-2"></i><span>${i18next.t('start-again')}</span>
        </button>`

    } else {
      document.getElementById('confirmation-message').innerHTML = `
      <p>${i18next.t('report-failed')}</p>  
      <i class="fas fa-times text-success display-1"></i>
      <button class="btn btn-primary mt-5" id="start-again-button" onclick={handleStartAgainClick()}>
          <i class="fas fa-arrow-left mr-2"></i><span>${i18next.t('start-again')}</span>
      </button>`
    }

  }).catch(error => {
    document.getElementById('confirmation-message').innerHTML = `
    <p>${i18next.t('report-failed')}</p>  
    <i class="fas fa-times text-danger display-1"></i>
    <button class="btn btn-primary mt-5" id="start-again-button" onclick={handleStartAgainClick()}>
        <i class="fas fa-arrow-left mr-2"></i><span>${i18next.t('start-again')}</span>
    </button>`
  });
});

// Function to add a new person card.
function addPersonCard() {
  const personCard = document.createElement('div');
  personCard.className = 'card mb-3 person-card';
  personCard.innerHTML = `
      <div class="card-body" data-person="">
        <div class="d-flex justify-content-between">
            <p>Enter the person's data</p>
            <button class="btn btn-link person-card-close" id="help-close-button" onclick="event.target.closest('.card').remove()"><i class="fas fa-times text-dark text-end"></i></button>
        </div>
        <div class="form-row">
          <div class="form-group col-md-6">
            <label for="name">${i18next.t('name')}</label>
            <input type="text" class="form-control" id="name" placeholder="${i18next.t('name-hint')}">
          </div>
          <div class="form-group col-md-6">
            <label for="nickname">${i18next.t('nickname')}</label>
            <input type="text" class="form-control" id="nickname" placeholder="${i18next.t('nickname-hint')}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-md-6">
            <label for="family-name">${i18next.t('family-name')}</label>
            <input type="text" class="form-control" id="family-name" placeholder="${i18next.t('family-name-hint')}">
          </div>
          <div class="form-group col-md-6">
            <label for="contact-number">${i18next.t('contact-number')}</label>
            <input type="tel" class="form-control" id="contact-number" placeholder="${i18next.t('contact-number-hint')}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-md-6">
            <label for="status">${i18next.t('status')}</label>
            <select class="form-control" id="status">
              <option>${i18next.t('status-healthy')}</option>
              <option>${i18next.t('status-disabled')}</option>
              <option>${i18next.t('status-injured')}</option>
            </select>
          </div>
          <div class="form-group col-md-6">
            <label for="age">${i18next.t('age')}</label>
            <input type="number" class="form-control" id="age" placeholder="${i18next.t('age-hint')}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-md-6">
            <label for="sex">${i18next.t('sex')}</label>
            <select class="form-control" id="sex">
              <option>${i18next.t('sex-male')}</option>
              <option>${i18next.t('sex-female')}</option>
              <option>${i18next.t('sex-others')}</option>
            </select>
          </div>
          <div class="form-group col-md-6">
            <label for="place">${i18next.t('place')}</label>
            <input type="text" class="form-control" id="place" placeholder="${i18next.t('place-hint')}">
          </div>
        </div>
      </div>
    `;
  document.getElementById('people-container').appendChild(personCard);
}

// Event listeners
document.getElementById('add-person-btn').addEventListener('click', function (event) {
  event.preventDefault();
  addPersonCard();
});

document.getElementById('situation').addEventListener('change', function (event) {
  event.preventDefault();

  var container = document.getElementById('reporter-container');
  container.style.display = event.target.value == 1 ? 'none' : 'block'
});

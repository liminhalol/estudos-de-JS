'use strict';

//   /|======[ ELEMENTS ]======|\
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//   /|======[ WORKOUT CLASSES ]======|\
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;
  constructor(coordinates, distance, duration) {
    this.coordinates = coordinates;
    this.distance = distance; // in kilometers
    this.duration = duration; // in minutes
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // prettier-ignore
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on 
    ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coordinates, distance, duration, cadence) {
    super(coordinates, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coordinates, distance, duration, elevationGain) {
    super(coordinates, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

//   /|======[ ARCHITECTURE ]======|\

class App {
  #map;
  #mapZoomLevel = 16;
  #mapEvent;
  #workouts = [];
  options = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 };

  constructor() {
    this._getPosition(); // INITIALIZE MAP

    // SUBMIT WORKOUTS
    this._getLocalStorage();

    // /|======[ HANDLERS ]======|\
    form.addEventListener('submit', this._newWorkout.bind(this)); // SUBMIT WORKOUTS
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this)); // MOVE TO POPUP

    // /|======[ TOGGLE WORKOUT TYPES ]======|\
    inputType.addEventListener('change', this._toggleElevationField);
    inputType.value = 'running';
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position!');
        },
        this.options
      );
    }
  }

  _loadMap(position) {
    //   /|======[ GET COORDINATES ]======|\
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    //   /|======[ INITIALIZE MAP ]======|\
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    //   /|======[ CUSTOM TILES ]======|\
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //   /|======[ DISPLAY FORM ]======|\
    this.#map.on('click', this._showForm.bind(this));

    //   /|======[ DISPLAY MARKERS ]======|\
    this.#workouts.forEach(workout => {
      this._renderWorkoutMarker(workout);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    // prettier-ignore
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();
    let workout;
    const { lat, lng } = this.#mapEvent.latlng;

    const validInput = (...inputs) =>
      inputs.every(input => Number.isFinite(input) && input > 0);

    // /|======[ GETTING DATA FROM FORM ]======|\
    const type = inputType.value;
    const duration = +inputDuration.value;
    const distance = +inputDistance.value;

    if (type === 'running') {
      const cadence = +inputCadence.value;

      // /|======[ CHECK IF DATA IS VALID ]======|\
      if (!validInput(duration, distance, cadence)) {
        alert('Inputs have to be positive numbers!');
        return;
      }

      // CREATE A RUNNING OBJECT
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    if (type === 'cycling') {
      const elevationGain = +inputElevation.value;

      // /|======[ CHECK IF DATA IS VALID ]======|\
      if (!validInput(duration, distance) && Number.isFinite(elevationGain)) {
        alert('Inputs have to be positive numbers!');
        return;
      }

      // CREATE A CYCLING OBJECT
      workout = new Cycling([lat, lng], distance, duration, elevationGain);
    }

    // /|======[ ADD TO WORKOUTS ARRAY ]======|\
    this.#workouts.push(workout);

    // /|======[ RENDER MARKER ]======|\
    this._renderWorkoutMarker(workout);

    // /|======[ RENDER WORKOUT ON THE LIST ]======|\
    this._renderWorkout(workout);

    //   /|======[ CLEAR INPUT FIELDS ]======|\
    this._hideForm();

    //   /|======[ STORE WORKOUTS ON LOCAL STORAGE ]======|\
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coordinates)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃' : '🚴'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title"> ${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon"> ${
            workout.type === 'running' ? '🏃' : '🚴'
          } </span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>`;

    if (workout.type === 'running') {
      html += `
       <div class="workout__details">
         <span class="workout__icon">⚡️</span>
         <span class="workout__value">${workout.pace.toFixed(1)}</span>
         <span class="workout__unit">min/km</span>
       </div>
       <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>`;
    } else {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>`;
    }
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;

    const workout = this.#workouts.find(
      workout => workout.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.coordinates, this.#mapZoomLevel, {
      animate: true,
      pan: { duration: 1 },
    });
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (!data) return;

    // /|======[ RESTORE WORKOUTS PROTOTYPE CHAIN ]======|\
    data.forEach(workoutData => {
      let workout;
      if (workoutData.type === 'running') {
        workout = new Running(
          workoutData.coordinates,
          workoutData.distance,
          workoutData.duration,
          workoutData.cadence
        );
      } else if (workoutData.type === 'cycling') {
        workout = new Cycling(
          workoutData.coordinates,
          workoutData.distance,
          workoutData.duration,
          workoutData.elevationGain
        );
      }

      // /|======[ RESTORE ID AND DATE ]======|\
      workout.id = workoutData.id;
      workout.date = new Date(workoutData.date);

      this.#workouts.push(workout);
    });

    this.#workouts.forEach(workout => {
      this._renderWorkout(workout);
    });
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();

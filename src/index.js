"use strict";
const months = [
  `January`,
  "Febuary",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const date = new Date();

class Workout {
  id;
  month;

  constructor(dataset, distance, duration, coord) {
    this.dataset = dataset;
    this.distance = distance;
    this.duration = duration;
    this.coord = coord;
    this.id = Math.trunc(Date.now() * Math.random());
    this.month = this.getDate(date.getMonth());
  }
  getDate(m) {
    const o = months.find((v, i, a) => i === m);
    return o;
  }
}

class Running extends Workout {
  constructor(dataset, distance, duration, cadence, coord) {
    super(dataset, distance, duration, coord);
    this.cadence = cadence;
  }
}
class Cycling extends Workout {
  constructor(dataset, distance, duration, elevGain, coord) {
    super(dataset, distance, duration, coord);
    this.elevGain = elevGain;
  }
}

///////////////////////////////////// Application
/////////////////////////////////////
const datasettype = document.querySelector(".form_type");
const distance = document.querySelector(".distance");
const duration = document.querySelector(".duration");
const candence = document.querySelector(".cadence");
const elevgain = document.querySelector(".elevgain");
const formElevgain = document.querySelector(".form_elevgain");
const formCadence = document.querySelector(".form_cadence");
const formSelect = document.getElementById("form_select");
const formBox = document.querySelector(".form_box");
const markerPopup = document.querySelector(".leaflet-popup-content-wrapper");
const markerGet = document.querySelector(".logo_section");

class App {
  #map;
  description;
  alldata = [];
  datas;
  #mapEvent;
  constructor() {
    this.getStorage();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((e) => {
        this.toggle();

        const { longitude: long, latitude: lat } = e.coords;
        this.#map = L.map("map").setView([lat, long], 13);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.#map);

        document.querySelector(".form_box").classList.add("form_row_hidden");
        this.getMapclick();
        this.renderForm();
        markerGet.addEventListener(`click`, this.getMarker.bind(this));
      });
    }
  }

  renderForm(event) {
    formBox.addEventListener("submit", this.submitForm.bind(this));
  }

  getMapclick() {
    this.#map.on("click", (e) => {
      document.querySelector(".form_box").classList.remove("form_row_hidden");
      this.#mapEvent = e.latlng;
    });
  }

  submitForm(ev) {
    ev.preventDefault();
    document.querySelector(".form_box").classList.remove("form_row_hidden");
    const valid = (...inputs) => inputs.every((inp) => Number.isFinite(inp));

    const check = formSelect.value === "running" ? candence : elevgain;
    const allInput = (...inp) => {
      const p = inp.every((v) => v > 0);
      return p;
    };

    if (formSelect.value === "running") {
      if (
        !allInput(+duration.value, +distance.value, +check.value) ||
        !valid(+duration.value, +distance.value, +check.value)
      )
        alert(`input a positive number`);
      if (
        allInput(+duration.value, +distance.value, +check.value) &&
        valid(+duration.value, +distance.value, +check.value)
      ) {
        let running = new Running(
          formSelect.value,
          +distance.value,
          +duration.value,
          +check.value,
          this.#mapEvent
        );

        this.alldata.push(running);
        this.renderWorkoutList(running);
        this.renderMarker(this.#mapEvent);
        document.querySelector(".form_box").classList.add("form_row_hidden");
        distance.value = "";
        check.value = "";
        duration.value = "";
      }
    }
    if (formSelect.value === "cycling") {
      if (
        !allInput(+duration.value, +distance.value, +check.value) ||
        !valid(+duration.value, +distance.value, +check.value)
      )
        alert(`input a positive number`);
      if (
        allInput(+duration.value, +distance.value, +check.value) &&
        valid(+duration.value, +distance.value, +check.value)
      ) {
        let cycling = new Cycling(
          formSelect.value,
          +distance.value,
          +duration.value,
          +check.value,
          this.#mapEvent
        );

        this.alldata.push(cycling);
        this.renderWorkoutList(cycling);
        this.renderMarker(this.#mapEvent);
        document.querySelector(".form_box").classList.add("form_row_hidden");
        distance.value = "";
        check.value = "";
        duration.value = "";
      }
    }
    this.setStorage();
  }

  // hide cadence when cycling is selected and show elevgain
  toggle() {
    formSelect.addEventListener("change", (e) => {
      formSelect.value === "cycling"
        ? formCadence.classList.toggle("form_row_hidden")
        : formElevgain.classList.toggle("form_row_hidden");
      formSelect.value === "running"
        ? formCadence.classList.toggle("form_row_hidden")
        : formElevgain.classList.toggle("form_row_hidden");
    });
  }
  /// insert workoutlist html elements
  renderWorkoutList(data) {
    this.datas = data;
    const check = data.dataset === "cycling" ? data.elevGain : data.cadence;
    const dates = date.getMonth();

    const html = `<div class="activity activity_${data.dataset}" data-id="${data.id}">
            <p class="activity_date">${data.dataset} on ${data.month} 29</p>
            <div class="activity_contents">
              <span>🏃‍♂️ ${data.distance} km</span><span>⏱ ${data.duration} min</span><span>⚡️ ${data.duration} min/km</span
              ><span>🦶🏼 ${check} spm</span>
            </div>
          </div>`;

    formBox.insertAdjacentHTML("afterend", html);
    const activity = document.querySelectorAll(".activity");

    this.description = `${data.dataset} on ${data.month} 29`;
  }
  // render marker
  renderMarker(en) {
    const { lat, lng } = en;

    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(`<p class="red">${this.description}</p>`, {
        keepInView: true,
        autoClose: false,
        autoPan: true,
        closeOnClick: false,
        className: `${this.datas?.dataset}`,
      })
      .openPopup();
  }

  getMarker(e) {
    const activity = e.target.closest(".activity");
    if (!activity) return;

    const hey = this.alldata.find((v) => {
      if (+v.id === +activity.dataset.id) {
        const { lat, lng } = v.coord;
        this.#map.setView([lat, lng], 13);
      }
    });
  }
  setStorage() {
    localStorage.setItem(`localdata`, JSON.stringify(this.alldata));
  }

  getStorage() {
    const datum = JSON.parse(localStorage.getItem("localdata"));
    if (!datum) return;
    this.alldata = datum;
    console.log(datum);
    this.alldata.forEach((d) => {
      this.renderWorkoutList(d);
    });
  }
}

new App();

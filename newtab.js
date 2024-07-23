const apiKey = "7f2ea9eb14fe4162a35122241242207";

document.addEventListener("DOMContentLoaded", function () {
  getCurrentLocationWeather();
});

document.getElementById("getWeather").addEventListener("click", function () {
  const location = document.getElementById("location").value;
  if (location) {
    fetchWeather({ q: location });
  } else {
    alert("Please enter a location.");
  }
});

function getCurrentLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeather({ q: `${lat}, ${lon}` });
      },
      function (error) {
        console.error("Error getting current location:", error);
        document.getElementById("weatherInfo").innerHTML =
          "<p>Error getting current location.</p>";
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
    document.getElementById("weatherInfo").innerHTML =
      "<p>Geolocation is not supported by this browser.</p>";
  }
}

function fetchWeather(params) {
  const queryString = new URLSearchParams({
    ...params,
    key: apiKey,
    aqi: "yes",
  }).toString();

  const url = `https://api.weatherapi.com/v1/current.json?${queryString}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.location.name) {
        displayWeather(data);
        displayTime(data);
        fetchForecast({ q: data.location.name });
      } else {
        document.getElementById("weatherInfo").innerHTML =
          "<p>Location not found.</p>";
      }
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
      document.getElementById("weatherInfo").innerHTML =
        "<p>Error fetching weather data.</p>";
    });
}

function fetchForecast(params) {
  const queryString = new URLSearchParams({
    ...params,
    key: apiKey,
    aqi: "yes",
    days: 5,
    alerts: "no",
  }).toString();
  const url = `https://api.weatherapi.com/v1/forecast.json?${queryString}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      displayForecast(data.forecast.forecastday);
    })
    .catch((error) => {
      console.error("Error fetching forecast data:", error);
      document.getElementById("forecastInfo").innerHTML =
        "<p>Error fetching forecast data.</p>";
    });
}

function displayWeather(data) {
  const weatherInfo = `
        <h2>${data.location.name}, ${data.location.country}</h2>
        <img src="${data.current.condition.icon}" alt="${data.current.condition.text}" />
        <p>${data.current.condition.text}</p>
        <p>Temperature: ${data.current.temp_c}°C</p>
        <p>Humidity: ${data.current.humidity}%</p>
        <p>Wind Speed: ${data.current.wind_kph} m/s</p>
    `;
  document.getElementById("weatherInfo").innerHTML = weatherInfo;

  // Set background image based on weather condition
  const weatherCondition = data.current.condition.code;
  const mainBg = document.getElementById("backgroundImg");

  let imgSrc;
  switch (weatherCondition) {
    case "clear":
      imgSrc = "images/clear.jpg";
      break;
    case 1240:
    case 1183:
      imgSrc = "images/rain.jpg";
      break;
    case "snow":
      imgSrc = "images/snow.jpg";
      break;
    case "clouds":
      imgSrc = "images/clouds.jpg";
      break;
    case "thunderstorm":
      imgSrc = "images/thunderstorm.jpg";
      break;
    default:
      imgSrc = "images/default.jpg";
      break;
  }

  mainBg.setAttribute("style", `background-image:url(${imgSrc})`);
}

function displayTime(data) {
  const timeInfo = `
        <p>Current Date and Time: ${data.location.localtime}</p>
    `;
  document.getElementById("timeInfo").innerHTML = timeInfo;
}

function displayForecast(forcastData) {
  let forecastHTML = "<h3>5-Day Forecast</h3>";
  forcastData.forEach((forcast) => {
    forecastHTML += `
            <div>
                <p>Date: ${forcast.date}</p>
                <p>Weather: ${forcast.day.condition.text}</p>
                <p>Temp: ${forcast.day.avgtemp_c}°C</p>
                <p>Humidity: ${forcast.day.avghumidity}%</p>
            </div>
            <hr>
        `;
  });
  document.getElementById("forecastInfo").innerHTML = forecastHTML;
}

const API_KEY = "99fed34f4c950bbe2d49d8dcd604b4c9"; // Replace with your OpenWeather API key
let currentTheme = 'default';
let currentUnit = "metric";

// Theme buttons
document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const theme = this.getAttribute('data-theme');
    currentTheme = theme;
    document.body.className = theme === 'default' ? '' : theme;
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});

// Set default theme active
document.querySelector('.theme-btn[data-theme="default"]').classList.add('active');

// Set unit
function setUnit(unit) {
  currentUnit = unit;
  if (document.getElementById("cityInput").value) {
    getWeather();
  }
}

// Show loading
function showLoading(show) {
  const loader = document.getElementById("loading");
  loader.classList.toggle("hidden", !show);
}

// Show error
function showError(message) {
  const errorBox = document.getElementById("error");
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
  setTimeout(() => errorBox.classList.add("hidden"), 3000);
}

// Fetch weather
async function getWeather() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) return alert('Please enter a city name');

  showLoading(true);

  try {
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}`;
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${currentUnit}`;

    const weatherRes = await fetch(weatherURL);
    const weatherData = await weatherRes.json();
    if (weatherData.cod !== 200) throw new Error();

    displayCurrentWeather(weatherData);

    const forecastRes = await fetch(forecastURL);
    const forecastData = await forecastRes.json();
    displayForecast(forecastData);

  } catch {
    showError("❌ City not found. Please try again.");
  } finally {
    showLoading(false);
  }
}

// Display current weather
function displayCurrentWeather(data) {
  const icon = data.weather[0].icon;
  const isNight = icon.includes('n');

  // Auto theme if default
  if (currentTheme === 'default') {
    const condition = data.weather[0].main.toLowerCase();
    document.body.className = '';
    if (isNight) document.body.classList.add('night');
    else if (condition.includes('rain')) document.body.classList.add('rainy');
    else if (condition.includes('cloud')) document.body.classList.add('cloudy');
    else if (condition.includes('snow')) document.body.classList.add('snowy');
    else document.body.classList.add('sunny');
  }

  document.getElementById('currentWeather').innerHTML = `
    <h2>${data.name}</h2>
    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" />
    <div class="temp">${Math.round(data.main.temp)}°${currentUnit === 'metric' ? 'C' : 'F'}</div>
    <div class="details">
      <div>💧 ${data.main.humidity}%</div>
      <div>☁ ${data.weather[0].description}</div>
    </div>
  `;
}

// Display forecast
function displayForecast(data) {
  const forecastContainer = document.getElementById('forecast');
  forecastContainer.innerHTML = '';

  const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00'));

  dailyData.forEach(day => {
    forecastContainer.innerHTML += `
      <div class="forecast-card">
        <div>${new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'short' })}</div>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" />
        <div>${Math.round(day.main.temp)}°${currentUnit === 'metric' ? 'C' : 'F'}</div>
      </div>
    `;
  });
}

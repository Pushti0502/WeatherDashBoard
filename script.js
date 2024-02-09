const apiKey = 'cde9d5d26979e29c75978438fe1e2d8d';
mapboxgl.accessToken =
    'pk.eyJ1IjoicHVzaHRpc2hhaCIsImEiOiJjbHNkMDZuMHcwdjZiMmxvNXRqanFvajQ0In0.4gjt9EvyjmbhKr7yCiSgYw';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-Button');
const cityElement = document.getElementById('city-name');
const currentData = document.getElementById('current-date');
const temperatureElement = document.getElementById('temperature');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('windSpeed');
const descriptionElement = document.getElementById('description');
const weatherIconElement = document.getElementById('weather-icon');
const forecastContainer = document.getElementById('forecast-container');
const historyList = document.getElementById('history-list');
const historyContainer = document.getElementById('search-history');
const sunriseElement = document.getElementById('sunrise');
const sunsetElement = document.getElementById('sunset');
const searchHistory = document.getElementById('search-history-text');
const changeTheme = document.getElementById('change-theme');
const changeTemperatureElement = document.getElementById('change-temperature');
const mapElement = document.getElementById('map');
const alertElement = document.getElementById('alert');
let temp = 'C';
let showAlert = false;

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [0, 0],
    zoom: 1,
    accessToken: mapboxgl.accessToken,
});
function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.documentElement.className = themeName;
}

function toggleTheme() {
    if (localStorage.getItem('theme') === 'theme-dark') {
        setTheme('theme-light');
    } else {
        setTheme('theme-dark');
    }
}
(function () {
    if (localStorage.getItem('theme') === 'theme-dark') {
        setTheme('theme-dark');
    } else {
        setTheme('theme-light');
    }
})();

searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();

    if (city === '') {
        alert('Please enter a city name.');
        return;
    }

    const currentWeatherUrl = `${apiUrl}?q=${city}&appid=${apiKey}&units=metric`;
    fetchWeatherData(currentWeatherUrl);

    const forecastWeatherUrl = `${forecastUrl}?q=${city}&appid=${apiKey}&units=metric`;
    fetchForecastData(forecastWeatherUrl);

    saveToHistory(city);
    cityInput.value = '';
});

changeTheme.addEventListener('click', () => {
    toggleTheme();
});
function showWeatherAlert() {
    showAlert = !showAlert;
    if (showAlert) {
        alert('Weather Alert : ' + descriptionElement.textContent);
        showAlert = false;
    }
}

alertElement.addEventListener('click', () => {
    showWeatherAlert();
});

function changeTemperature() {
    if (temp === 'C') {
        temp = 'F';
    } else {
        temp = 'C';
    }

    updateTemperatureDisplay();
}

changeTemperatureElement.addEventListener('click', () => {
    changeTemperature();
});

async function updateTemperatureDisplay() {
    try {
        const currentWeatherUrl = `${apiUrl}?q=${cityElement.textContent}&appid=${apiKey}&units=metric`;
        const response = await fetch(currentWeatherUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        let temperature;
        if (temp === 'C') {
            temperature = Math.round(data.main.temp);
        } else {
            temperature = Math.round((data.main.temp * 9) / 5 + 32);
        }

        temperatureElement.textContent = `Temperature: ${temperature}°${temp}`;
    } catch (error) {
        console.error('Error updating temperature display:', error);
        alert('Error updating temperature display. Please try again.');
    }
}

async function fetchWeatherData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('data', data);

        const cityName = data.name;
        const date = new Date(data.dt * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
        const temperature = Math.round(data.main.temp);
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        const description = data.weather[0].main;
        const weatherIcon = data.weather[0].icon;
        const sunriseTime = new Date(
            data.sys.sunrise * 1000
        ).toLocaleTimeString();
        const sunsetTime = new Date(
            data.sys.sunset * 1000
        ).toLocaleTimeString();

        cityElement.textContent = `${cityName}`;
        currentData.textContent = `${date}`;
        temperatureElement.textContent = `Temperature: ${temperature}°C`;
        humidityElement.textContent = `Humidity: ${humidity}%`;
        windSpeedElement.textContent = `Wind Speed: ${windSpeed} m/s`;

        descriptionElement.textContent = `${description}`;
        weatherIconElement.src = `http://openweathermap.org/img/w/${weatherIcon}.png`;
        sunriseElement.textContent = `Sunrise: ${sunriseTime}`;
        sunsetElement.textContent = `Sunset: ${sunsetTime}`;
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Error fetching current weather data. Please try again.');
    }
}

async function fetchForecastData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const forecastList = data.list;

        forecastContainer.innerHTML = '';

        for (let i = 0; i < forecastList.length; i += 8) {
            const forecastData = forecastList[i];
            // console.log('forecastData', forecastData);
            const date = new Date(forecastData.dt * 1000).toLocaleDateString(
                'en-US',
                { month: 'short', day: 'numeric', year: 'numeric' }
            );
            const high = Math.round(forecastData.main.temp_max);
            const low = Math.round(forecastData.main.temp_min);
            const temperature = Math.round(forecastData.main.temp);
            const humidity = forecastData.main.humidity;
            const windSpeed = forecastData.wind.speed;
            const weatherIcon = forecastData.weather[0].icon;
            const sunriseTime = new Date(
                forecastData.sys.sunrise * 1000
            ).toLocaleTimeString();
            const sunsetTime = new Date(
                forecastData.sys.sunset * 1000
            ).toLocaleTimeString();

            const forecastCard = document.createElement('div');
            forecastCard.classList.add('card');

            const cardContent = document.createElement('div');
            cardContent.classList.add('class');

            const dateElement = document.createElement('h3');
            dateElement.textContent = date;
            cardContent.appendChild(dateElement);

            const imgElement = document.createElement('img');
            imgElement.src =
                'http://openweathermap.org/img/w/' + weatherIcon + '.png';
            cardContent.appendChild(imgElement);

            const weatherMainElement = document.createElement('h4');
            weatherMainElement.textContent = forecastData.weather[0].main;
            cardContent.appendChild(weatherMainElement);

            const highElement = document.createElement('p');
            highElement.textContent = 'High: ' + high + '°C';
            cardContent.appendChild(highElement);

            const lowElement = document.createElement('p');
            lowElement.textContent = 'Low: ' + low + '°C';
            cardContent.appendChild(lowElement);

            const temperatureElement = document.createElement('p');
            temperatureElement.textContent =
                'Temperature: ' + temperature + '°C';
            cardContent.appendChild(temperatureElement);

            const humidityElement = document.createElement('p');
            humidityElement.textContent = 'Humidity: ' + humidity + '%';
            cardContent.appendChild(humidityElement);

            const windSpeedElement = document.createElement('p');
            windSpeedElement.textContent = 'Wind Speed: ' + windSpeed + 'm/s';
            cardContent.appendChild(windSpeedElement);

            // const sunriseElement = document.createElement('p');
            // sunriseElement.textContent = 'Sunrise: ' + sunriseTime ;
            // cardContent.appendChild(sunriseElement);

            // const sunsetElement = document.createElement('p');
            // sunsetElement.textContent = 'SunSet: ' + sunsetTime ;
            // cardContent.appendChild(sunsetElement);

            forecastCard.appendChild(cardContent);

            forecastCard.addEventListener('click', () => {
                updateCurrentWeather(forecastData);
            });
            forecastContainer.appendChild(forecastCard);
        }
    } catch (error) {
        console.error(error);
        alert('Error fetching forecast data. Please try again.');
    }
}
function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;

            const weatherUrl = `${apiUrl}?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
            const forecastweatherUrl = `${forecastUrl}?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

            fetchWeatherData(weatherUrl);
            fetchForecastData(forecastweatherUrl);
        });
    } else {
        console.log('Geolocation is not supported by this browser.');
    }
}

window.onload = getCurrentLocationWeather;

async function updateCurrentWeather(data) {
    try {
        const date = new Date(data.dt * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
        const temperature = Math.round(data.main.temp);
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        const description = data.weather[0].main;
        const weatherIcon = data.weather[0].icon;

        currentData.textContent = `${date}`;
        temperatureElement.textContent = `Temperature:${temperature}°C`;
        humidityElement.textContent = `Humidity: ${humidity} %`;
        windSpeedElement.textContent = `Wind Speed: ${windSpeed} m/s`;
        descriptionElement.textContent = `${description}`;
        const response = await fetch(
            `http://openweathermap.org/img/w/${weatherIcon}.png`
        );
        if (!response.ok) {
            throw new Error(
                `Failed to fetch weather icon: ${response.statusText}`
            );
        }
        const weatherIconUrl = response.url;
        weatherIconElement.src = weatherIconUrl;
    } catch (error) {
        console.log(error);
        alert('Error while updating the data.Please try again');
    }
}
map.on('click', function (e) {
    var clickedLongitude = e.lngLat.lng;
    var clickedLatitude = e.lngLat.lat;
    // console.log('Clicked location:', clickedLatitude, clickedLongitude);
    var currentWeatherUrl = `${apiUrl}?lat=${clickedLatitude}&lon=${clickedLongitude}&appid=${apiKey}&units=metric`;
    const forecastweatherUrl = `${forecastUrl}?lat=${clickedLatitude}&lon=${clickedLongitude}&appid=${apiKey}&units=metric`;
    fetchWeatherData(currentWeatherUrl);
    fetchForecastData(forecastweatherUrl);
});
async function saveToHistory(city) {
    try {
        let history =
            (await JSON.parse(localStorage.getItem('weatherHistory'))) || [];
        history.unshift(city);
        const limitedHistory = history.slice(0, 5);
        localStorage.setItem('weatherHistory', JSON.stringify(limitedHistory));
        displayHistory();
    } catch (error) {
        console.error('Error saving to history:', error);
    }
}

async function displayHistory() {
    try {
        const history =
            (await JSON.parse(localStorage.getItem('weatherHistory'))) || [];

        historyList.innerHTML = '';

        history.forEach((city) => {
            const listItem = document.createElement('li');
            listItem.textContent = city;
            listItem.addEventListener('click', () => {
                cityInput.value = city;
                searchButton.click();
            });
            historyList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error displaying history:', error);
    }
}

displayHistory();

historyList.addEventListener('click', (event) => {
    if (event.target) {
        const selectedCity = event.target.textContent;
        cityInput.value = selectedCity;
        const currentWeatherUrl = `${apiUrl}?q=${selectedCity}&appid=${apiKey}&units=metric`;
        fetchWeatherData(currentWeatherUrl);
        const forecastWeatherUrl = `${forecastUrl}?q=${selectedCity}&appid=${apiKey}&units=metric`;
        fetchForecastData(forecastWeatherUrl);
        cityInput.value = ' ';
        historyList.classList.remove('show');
    }
});

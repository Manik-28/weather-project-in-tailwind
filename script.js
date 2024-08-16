// Get references to DOM elements
document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = '83df7b197ac7c61e31e541edc5f48a83';
    const cityInput = document.querySelector('.city-input');
    const searchButton = document.querySelector('.search-btn');
    const locationButton = document.querySelector('.location-btn');
    const currentWeatherElem = document.querySelector('.current-weather');
    const weatherCardsElem = document.querySelector('.weather-cards');
    const recentCitiesSelect = document.querySelector('#recent-cities');

    // Function to create weather card for the current and forecasted weather
    const createWeatherCard = (cityName, weatherItem, index) => {
        const formattedDate = new Date(weatherItem.dt_txt).toLocaleDateString();
        const temperature = (weatherItem.main.temp - 273.15).toFixed(2); // Convert from Kelvin to Celsius
        const windSpeed = weatherItem.wind.speed;
        const humidity = weatherItem.main.humidity;
        const weatherDescription = weatherItem.weather[0].description;
        const weatherIcon = `https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@${index === 0 ? '4x' : '2x'}.png`;

        if (index === 0) {
            return `
                <div class="detail text-center">
                    <h2 class="text-2xl font-semibold mb-2">${cityName} (${formattedDate})</h2>
                    <h4 class="text-lg">Temperature: ${temperature}°C</h4>
                    <h4 class="text-lg">Wind: ${windSpeed} M/S</h4>
                    <h4 class="text-lg">Humidity: ${humidity}%</h4>
                </div>
                <div class="icon text-center mt-4">
                    <img src="${weatherIcon}" alt="Weather-icon" class="inline-block">
                    <h4 class="capitalize mt-2 text-lg">${weatherDescription}</h4>
                </div>`;
        } else {
            return `
                <li class="card bg-gray-600 text-white p-4 rounded space-y-2">
                    <h3 class="text-lg text-center">${formattedDate}</h3>
                    <img src="${weatherIcon}" alt="weather-icon" class="img mx-auto max-w-[70px]">
                    <h4 class="text-lg mt-2 text-center">Temp: ${temperature}°C</h4>
                    <h4 class="text-lg mt-2 text-center">Wind: ${windSpeed} M/S</h4>
                    <h4 class="text-lg mt-2 text-center">Humidity: ${humidity}%</h4>
                </li>`;
        }
    };

    // Function to fetch weather details using coordinates
    const getWeatherDetails = async (cityName, lat, lon) => {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
            const data = await response.json();

            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            // Update the UI with the current weather
            currentWeatherElem.innerHTML = createWeatherCard(cityName, fiveDaysForecast[0], 0);

            // Update the UI with the 5-day weather forecast
            weatherCardsElem.innerHTML = fiveDaysForecast.slice(1).map((weatherItem, index) => createWeatherCard(cityName, weatherItem, index + 1)).join("");

            // Update recent searches dropdown
            if (!Array.from(recentCitiesSelect.options).some(option => option.value === cityName)) {
                const option = document.createElement('option');
                option.value = cityName;
                option.textContent = cityName;
                recentCitiesSelect.appendChild(option);
            }
        } catch (error) {
            alert("An error occurred while fetching weather data.");
        }
    };

    // Function to fetch city coordinates using city name
    const fetchCityCoordinates = async (cityName) => {
        try {
            const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`);
            const data = await response.json();
            if (!data.length) {
                alert(`No coordinates found for ${cityName}`);
                return;
            }
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        } catch (error) {
            alert("An error occurred while fetching the city coordinates.");
        }
    };

    // Function to fetch user coordinates using Geolocation API
    const getUserCoordinates = () => {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                getWeatherDetails("Your Location", latitude, longitude);
            },
            error => {
                if (error.code === error.PERMISSION_DENIED) {
                    alert("Geolocation request denied. Please reset location permission to grant access again.");
                } else {
                    alert("An error occurred while fetching your location.");
                }
            }
        );
    };

    // Event listeners for search button, location button, and enter key in input field
    searchButton.addEventListener('click', () => {
        const cityName = cityInput.value.trim();
        if (cityName) {
            fetchCityCoordinates(cityName);
        } else {
            alert("Please enter a city name");
        }
    });

    locationButton.addEventListener('click', getUserCoordinates);

    cityInput.addEventListener('keyup', e => {
        if (e.key === "Enter") {
            const cityName = cityInput.value.trim();
            if (cityName) {
                fetchCityCoordinates(cityName);
            } else {
                alert("Please enter a city name");
            }
        }
    });
});


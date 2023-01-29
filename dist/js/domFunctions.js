export const setPlaceholderText = () => {
    const input = document.getElementById("searchBar_text");
    window.innerWidth < 400 ? (input.placeholder = "Country, City or State") : (input.placeholder = "Country, State, City or Postcode")
};

export const addSpinner = (element) => {
    animateButton(element);
    setTimeout(animateButton, 1000, element);
};

const animateButton = (element) => {
    element.classList.toggle("none");
    element.nextElementSibling.classList.toggle("block");
    element.nextElementSibling.classList.toggle("none");
  };

export const displayError = (headerMsg, srMsg) => {
    updateWeatherLocationHeader(headerMsg);
    updateScreenReaderConfirmation(srMsg);
};

export const displayAPIError = (statusCode) => {
    const properMsg = toProperCase(statusCode.message);
    updateWeatherLocationHeader(properMsg);
    updateScreenReaderConfirmation(`${properMsg}. Please try again`);
};

const toProperCase = (text) => {
    const words = text.split(" ");
    const properWords = words.map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return properWords.join(" ");
}

const updateWeatherLocationHeader = (message) => {
    const h1 = document.getElementById("currentForecast_location");
    if (message.indexOf("Lat:") !== -1 && message.indexOf("Long:") !== -1) {
        const msgArray = message.split(" ");
        const mapArray = message.map(msg => {
            return msg.replace(":", ": ");
        })
        const lat = mapArray[0].indexOf("-") === -1 ? mapArray[0].slice(0, 10) : mapArray[0].slice(0, 11);
        const lon = mapArray[1].indexOf("-") === -1 ? mapArray[1].slice(0, 11) : mapArray[1].slice(0, 12);

        h1.textContent = `${lat} • ${lon}`;
    } else {
        h1.textContent = message;
    }
};

export const updateScreenReaderConfirmation = (message) => {
    document.getElementById("confirmation").textContent = message;
};

export const updateDisplay = (weatherJson, locationObj) => {
    fadeDisplay();
    clearDisplay();
    
    const weatherClass = getWeatherClass(weatherJson.current.weather[0].icon);
    setBGImage(weatherClass);
    const screenReaderWeather = buildScreenReaderWeather(weatherJson, locationObj);
    updateScreenReaderConfirmation(screenReaderWeather);
    updateWeatherLocationHeader(locationObj.getName());

    // Current Conditions
    const ccArray = createCurrentConditionsDivs(weatherJson, locationObj.getUnit());
    displayCurrentConditions(ccArray);
    // Weekly Forecast
    displaySixDayForecast(weatherJson);

    setFocusOnSearch();

    fadeDisplay();
};

const fadeDisplay = () => {
    const cc = document.getElementById("currentForecast");
    cc.classList.toggle("zero-vis");
    cc.classList.toggle("fade-in");

    const weeklyC = document.getElementById("weeklyForecast");
    cc.classList.toggle("zero-vis");
    cc.classList.toggle("fade-in");
};

const clearDisplay = () => {
    const currentConditions = document.getElementById("currentForecast_condtions");
    deleteContents(currentConditions);
    const weeklyForecast = document.getElementById("weeklyForecast_contents");
    deleteContents(weeklyForecast);
};

const deleteContents = (parentElement) => {
    let child = parentElement.lastElementChild;
    while (child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
};

const getWeatherClass = (icon) => {
    const firstTwoChars = icon.slice(0, 2);
    const lastChar = icon.slice(2);
    const weatherLookUp = {
        "01" : "clear",
        "02" : "cloudy", //"less cloudy",
        "03" : "cloudy",
        "04" : "cloudy", //"more cloudy",
        "09" : "rainy", //"less rain",
        "10" : "rainy",
        "11" : "rainy", //"more rain",
        "13" : "snowy",
        "50" : "foggy"
    };
    let weatherClass;
    if (weatherLookUp[firstTwoChars]) {
        weatherClass = weatherLookUp[firstTwoChars];
    } else if (lastChar === "d") {
        weatherClass = "cloudy";
    } else {
        weatherClass = "night";
    }
    return weatherClass;
};

const setBGImage = (weatherClass) => {
    document.documentElement.classList.add(weatherClass);
    document.documentElement.classList.forEach(img => {
        if (img !== weatherClass) document.documentElement.classList.remove(img);
    });
};

const buildScreenReaderWeather = (weatherJson, locationObj) => {
    const location = locationObj.getName();
    const unit = locationObj.getUnit();
    const tempUnit = unit === "metric" ? "Celsius" : "Fahrenheit";
    return `${weatherJson.current.weather[0].desciption} and ${Math.round(Number(weatherJson.current.temp))}°${tempUnit} in ${location}`;
};

const setFocusOnSearch = () => {
    document.getElementById("searchBar_text").focus();
};

const createCurrentConditionsDivs = (weatherObj, unit) => {
    const tempUnit = unit === "metric" ? "C" : "F";
    const windUnit = unit === "metric" ? "m/s" : "mph";
    const icon = createMainImgDiv(weatherObj.current.weather[0].icon, weatherObj.current.weather[0].desciption);
    const temp = createElem("div", "temp", `${Math.round(Number(weatherObj.current.temp))}°`, tempUnit);
    const properDesc = toProperCase(weatherObj.current.weather[0].desciption);
    const desc = createElem("div", "desc", properDesc);
    const feels = createElem("div", "feels", `Feels like ${Math.round(Number(weatherObj.current.feels_like))}°`);
    const maxTemp = createElem("div", "maxtemp", `High of ${Math.round(Number(weatherObj.daily[0].temp.max))}°`);
    const minTemp = createElem("div", "mintemp", `Low of ${Math.round(Number(weatherObj.daily[0].temp.min))}°`);
    const humidity = createElem("div", "humidity", `Humidity of ${Math.round(Number(weatherObj.current.humidity))}%`)
    const wind = createElem("div", "wind", `Wind of ${Math.round(Number(weatherObj.current.wind_speed))} ${windUnit}`);
    return [icon, temp, desc, feels, maxTemp, minTemp, humidity, wind];
};

const createMainImgDiv = (icon, altText) => {
    const iconDiv = createElem("div", "icon");
    iconDiv.id = "icon";
    const faIcon = translateIconToFontAwesome(icon);
    faIcon.ariaHidden = true;
    faIcon.title = altText;
    iconDiv.appendChild(faIcon);
    return iconDiv;
};

const createElem = (elemType, divClassName, divText, unit) => {
    const div = document.createElement(elemType);
    div.className = divClassName;
    if (divText) {
        div.textContent = divText;
    }
    if (divClassName === "temp") {
        const unitDiv = document.createElement("div");
        unitDiv.classList.add("unit");
        unitDiv.textContent = unit;
        div.appendChild(unitDiv);
    }
    return div;
};

const translateIconToFontAwesome = (icon) => {
    const i = document.createElement("i");
    const firstTwoChars = icon.slice(0,2);
    const lastChar = icon.slice(2);
    switch (firstTwoChars) {
        case "01":
            if (lastChar === "d") {
                i.classList.add("far", "fa-sun");
            } else {
                i.classList.add("far", "fa-moon");
            }
            break;
        case "02":
            if (lastChar === "d") {
                i.classList.add("fas", "fa-cloud-sun");
            } else {
                i.classList.add("fas", "fa-cloud-moon");
            }
            break;
        case "03":
            i.classList.add("fas", "fa-cloud");
            break;
        case "04":
            i.classList.add("fas", "fa-cloud-meatball");
            break;
        case "09":
            i.classList.add("fas", "fa-cloud-rain");
            break;
        case "10":
            if (lastChar === "d") {
                i.classList.add("fas", "fa-cloud-sun-rain");
            } else {
                i.classList.add("fas", "fa-cloud-moon-rain");
            }
            break;
        case "11":
            i.classList.add("fas", "fa-poo-storm");
            break;
        case "13":
            i.classList.add("fas", "fa-snowflake");
            break;
        case "50":
            i.classList.add("fas", "fa-smog");
            break;
        default:
            i.classList.add("far", "fa-question-circle");
    }
    return i;
};

const displayCurrentConditions = (currentConditionsArray) => {
    const ccContainer = document.getElementById("currentForecast_conditions");
    currentConditionsArray.forEach(cc => {
        ccContainer.appendChild(cc);
    });
};

const displaySixDayForecast = (weatherJson) => {
  for (let i = 1; i <= 6; i++) {
    const wkfArray = createWeeklyForecastDivs(weatherJson.daily[i]);
    displayWeeklyForecast(wkfArray);
  }  
};

const createWeeklyForecastDivs = (weekWeather) => {
    const dayAbbText = getDayAbb(weekWeather.dt)
    const dayAbb = createElem("p", "dayAbb", dayAbbText);
    const dayIcon = createWeeklyForecastIcon(weekWeather.weather[0].icon, weekWeather.weather[0].desciption);
    const dayHigh = createElem("p", "dayHigh", `${Math.round(Number(weekWeather.temp.max))}°`);
    const dayLow = createElem("p", "dayLow", `${Math.round(Number(weekWeather.temp.min))}°`);

    return [dayAbb, dayIcon, dayHigh, dayLow];
};

const getDayAbb = (data) => {
    const dateObj = new Data(data * 1000);
    const utcString = dateObj.toUTCString();
    return utcString.slice(0, 3).toUpperCase();
};

const createWeeklyForecastIcon = (icon, altText) => {
    const img = document.createElement("img");
    if (window.innerWidth < 768 || window.innerHeight < 1025) {
        img.src = `https://openweathermap.org/img/wn/${icon}.png`
    } else {
        img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`
    }
    img.alt = altText;
    return img;
};

const displayWeeklyForecast = (wkfArray) => {
    const dayDiv = createElem("div", "forecastDay");
    wkfArray.forEach(el => {
        dayDiv.appendChild(el);
    });
    const weeklyForecastContainer = document.getElementById("weeklyForecast_contents");
    weeklyForecastContainer.appendChild(dayDiv);
};
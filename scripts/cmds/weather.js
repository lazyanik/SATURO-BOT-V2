const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "weather",
    version: "1.7",
    author: "T A N J I L",
    description: "Get current weather info with BD time, sunrise and sunset",
    usage: ".weather [city]",
    category: "utility",        // <-- category fixed
    cooldowns: 5
  },

  onStart: async function ({ api, event, args }) {
    const city = args.join(" ");
    if (!city) return api.sendMessage("Please enter a city name.\nExample: .weather Dhaka", event.threadID);

    const apiKey = "a2ef576aedf483dbe1599216e3e146c0";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

    try {
      const res = await axios.get(url);
      const data = res.data;

      const toBDTime = (unix) =>
        new Date(unix * 1000).toLocaleTimeString("en-US", {
          timeZone: "Asia/Dhaka",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        });

      const updateTime = new Date(data.dt * 1000).toLocaleString("en-US", {
        timeZone: "Asia/Dhaka"
      });

      const currentTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Dhaka"
      });

      const sunriseTime = toBDTime(data.sys.sunrise);
      const sunsetTime = toBDTime(data.sys.sunset);

      const weatherText =
        `☁️ Weather in ${data.name}, ${data.sys.country}:\n` +
        `🌡️ Temperature: ${data.main.temp}°C\n` +
        `🌤️ Condition: ${data.weather[0].description}\n` +
        `💧 Humidity: ${data.main.humidity}%\n` +
        `🌬️ Wind Speed: ${data.wind.speed} m/s\n` +
        `🌅 Sunrise: ${sunriseTime}\n` +
        `🌇 Sunset: ${sunsetTime}\n` +
        `🕒 Data Updated: ${updateTime}\n` +
        `⏰ Current Time: ${currentTime} (BD Time)`;

      const imageUrl = "https://res.cloudinary.com/mahiexe/image/upload/v1748113926/mahi/1748113926085-913546189.png";
      const imagePath = path.join(__dirname, "weather_image.png");
      const image = await axios.get(imageUrl, { responseType: 'stream' });

      const writer = fs.createWriteStream(imagePath);
      image.data.pipe(writer);

      writer.on('finish', () => {
        api.sendMessage({
          body: weatherText,
          attachment: fs.createReadStream(imagePath)
        }, event.threadID, () => {
          fs.unlinkSync(imagePath);
        });
      });

    } catch (err) {
      console.log(err);
      if (err.response && err.response.status === 404) {
        api.sendMessage("❌ City not found. Please check the city name.", event.threadID);
      } else {
        api.sendMessage("❌ Error fetching weather data. Please try again later.", event.threadID);
      }
    }
  }
};

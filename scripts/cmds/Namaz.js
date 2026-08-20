const axios = require("axios");

module.exports = {
  config: {
    name: 'namaz',
    aliases: ['salah', 'prayertime', 'salat', 'namaj'],
    version: '1.0',
    author: 'Mueid Mursalin Rifat',
    countDown: 5,
    role: 0,
    shortDescription: 'Get Islamic prayer times',
    longDescription: 'Get accurate prayer times for any city worldwide',
    category: 'info',
    guide: {
      en: '{pn} [city] [country]\nExample: {pn} Dhaka Bangladesh\n{pn} Riyadh Saudi Arabia\n{pn} Dubai UAE'
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      // Check if user provided arguments
      if (args.length === 0) {
        return api.sendMessage(
          `🕌 𝗡𝗮𝗺𝗮𝘇 / 𝗦𝗮𝗹𝗮𝗵 𝗧𝗶𝗺𝗲𝘀\n━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `📌 𝗨𝘀𝗮𝗴𝗲:\n` +
          `• ${this.config.name} [city] [country]\n\n` +
          `📍 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:\n` +
          `• .namaz Dhaka Bangladesh\n` +
          `• .namaz New York USA\n` +
          `• .namaz London UK\n\n` +
          `🤲 May Allah accept your prayers!`,
          event.threadID,
          event.messageID
        );
      }
      
      let city, country;
      
      // Parse arguments
      if (args.length >= 2) {
        // If country name has multiple words
        const multiWordCountries = [
          "united kingdom", "united states", "united arab emirates", 
          "saudi arabia", "south africa", "south korea", "new zealand",
          "north korea", "bosnia herzegovina", "czech republic"
        ];
        
        const argsLower = args.join(" ").toLowerCase();
        
        let foundCountry = "";
        for (const multiCountry of multiWordCountries) {
          if (argsLower.includes(multiCountry)) {
            foundCountry = multiCountry;
            const countryWords = multiCountry.split(" ").length;
            city = args.slice(0, -countryWords).join(" ");
            country = args.slice(-countryWords).join(" ");
            break;
          }
        }
        
        if (!foundCountry) {
          city = args.slice(0, -1).join(" ");
          country = args[args.length - 1];
        }
      } else {
        return api.sendMessage(
          `❌ Please specify both city and country.\n\n` +
          `📌 𝗖𝗼𝗿𝗿𝗲𝗰𝘁 𝗙𝗼𝗿𝗺𝗮𝘁:\n` +
          `• ${this.config.name} [city] [country]\n\n` +
          `📌 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:\n` +
          `• ${this.config.name} ${args[0]} Bangladesh\n` +
          `• ${this.config.name} ${args[0]} Pakistan\n` +
          `• ${this.config.name} ${args[0]} USA`,
          event.threadID,
          event.messageID
        );
      }
      
      // Send waiting message
      const waitingMsg = await api.sendMessage(
        `🕌 Fetching prayer times for ${city}, ${country}...\n⏳ Please wait...`,
        event.threadID,
        event.messageID
      );
      
      // Make API request
      const response = await axios.get(
        `https://shadowx-api.onrender.com/api/namaz?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`,
        { timeout: 10000 }
      );
      
      const data = response.data;
      
      if (!data.status) {
        throw new Error("API returned an error response");
      }
      
      // Format the timings
      const timings = data.timings;
      const location = data.location;
      
      // Get current time in that timezone
      function getCurrentTime(timezone) {
        try {
          const now = new Date();
          const options = { 
            timeZone: timezone || 'UTC', 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
          };
          return now.toLocaleTimeString('en-US', options);
        } catch (error) {
          return "N/A";
        }
      }
      
      // Calculate time remaining for next prayer
      function getNextPrayer(currentTime, timings) {
        if (currentTime === "N/A") return null;
        
        const prayers = [
          { name: "Fajr", time: timings.Fajr, emoji: "🌅" },
          { name: "Dhuhr", time: timings.Dhuhr, emoji: "☀️" },
          { name: "Asr", time: timings.Asr, emoji: "⛅" },
          { name: "Maghrib", time: timings.Maghrib, emoji: "🌇" },
          { name: "Isha", time: timings.Isha, emoji: "🌙" }
        ];
        
        const [currentHour, currentMinute] = currentTime.split(":").map(Number);
        const currentMinutes = currentHour * 60 + currentMinute;
        
        for (let prayer of prayers) {
          const [prayerHour, prayerMinute] = prayer.time.split(":").map(Number);
          const prayerMinutes = prayerHour * 60 + prayerMinute;
          
          if (prayerMinutes > currentMinutes) {
            const minutesLeft = prayerMinutes - currentMinutes;
            const hours = Math.floor(minutesLeft / 60);
            const minutes = minutesLeft % 60;
            
            return {
              name: prayer.name,
              emoji: prayer.emoji,
              time: prayer.time,
              hoursLeft: hours,
              minutesLeft: minutes,
              totalMinutesLeft: minutesLeft
            };
          }
        }
        
        const [fajrHour, fajrMinute] = timings.Fajr.split(":").map(Number);
        const fajrMinutes = fajrHour * 60 + fajrMinute;
        const minutesLeft = (24 * 60 - currentMinutes) + fajrMinutes;
        const hours = Math.floor(minutesLeft / 60);
        const minutes = minutesLeft % 60;
        
        return {
          name: "Fajr",
          emoji: "🌅",
          time: timings.Fajr,
          hoursLeft: hours,
          minutesLeft: minutes,
          totalMinutesLeft: minutesLeft,
          isTomorrow: true
        };
      }
      
      // Get current time
      const currentTime = getCurrentTime(location.timezone);
      const nextPrayer = currentTime !== "N/A" ? getNextPrayer(currentTime, timings) : null;
      
      // Create beautiful message with better design
      let message = `╔════════════════════════════════╗\n`;
      message += `║        🕌 𝗣𝗥𝗔𝗬𝗘𝗥 𝗧𝗜𝗠𝗘𝗦        ║\n`;
      message += `╚════════════════════════════════╝\n\n`;
      
      message += `📍 𝗟𝗼𝗰𝗮𝘁𝗶𝗼𝗻: ${data.city}, ${data.country}\n`;
      message += `📅 ${data.date} • ${data.weekday}\n`;
      message += `🌙 ${data.hijri} (${data.hijriMonth})\n`;
      
      if (currentTime !== "N/A") {
        message += `⏰ 𝗖𝘂𝗿𝗿𝗲𝗻𝘁 𝗧𝗶𝗺𝗲: ${currentTime}\n`;
      }
      
      message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      
      // Prayer Times in a beautiful table
      message += `🕋 𝗗𝗔𝗜𝗟𝗬 𝗦𝗔𝗟𝗔𝗛 𝗧𝗜𝗠𝗘𝗦\n`;
      message += `┌─────────────────────────────┐\n`;
      message += `│ 🌅  Fajr     ▸  ${timings.Fajr.padEnd(8)}│\n`;
      message += `│ 🌄  Sunrise  ▸  ${timings.Sunrise.padEnd(8)}│\n`;
      message += `│ ☀️  Dhuhr    ▸  ${timings.Dhuhr.padEnd(8)}│\n`;
      message += `│ ⛅  Asr      ▸  ${timings.Asr.padEnd(8)}│\n`;
      message += `│ 🌇  Maghrib  ▸  ${timings.Maghrib.padEnd(8)}│\n`;
      message += `│ 🌙  Isha     ▸  ${timings.Isha.padEnd(8)}│\n`;
      message += `└─────────────────────────────┘\n\n`;
      
      // Important Times
      message += `⏳ 𝗜𝗠𝗣𝗢𝗥𝗧𝗔𝗡𝗧 𝗧𝗜𝗠𝗘𝗦\n`;
      message += `├─────────────────────────────┤\n`;
      message += `│ Imsak      ▸  ${timings.Imsak.padEnd(10)}│\n`;
      message += `│ Midnight   ▸  ${timings.Midnight.padEnd(10)}│\n`;
      message += `│ 1st Third  ▸  ${timings.Firstthird.padEnd(10)}│\n`;
      message += `│ Last Third ▸  ${timings.Lastthird.padEnd(10)}│\n`;
      message += `└─────────────────────────────┘\n\n`;
      
      // Next Prayer Information
      if (nextPrayer) {
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `🕌 𝗡𝗘𝗫𝗧 𝗦𝗔𝗟𝗔𝗛\n`;
        message += `┌─────────────────────────────┐\n`;
        
        if (nextPrayer.isTomorrow) {
          message += `│ ${nextPrayer.emoji}  ${nextPrayer.name} (Tomorrow)\n`;
          message += `│ ⏰ Time: ${nextPrayer.time}\n`;
          message += `│ ⏳ Remaining: ${nextPrayer.hoursLeft}h ${nextPrayer.minutesLeft}m\n`;
          message += `│ 💫 Night prayers are highly rewarded!\n`;
        } else {
          message += `│ ${nextPrayer.emoji}  ${nextPrayer.name}\n`;
          message += `│ ⏰ Time: ${nextPrayer.time}\n`;
          message += `│ ⏳ Remaining: ${nextPrayer.hoursLeft}h ${nextPrayer.minutesLeft}m\n`;
          
          const prayerTips = {
            "Fajr": "• Wake up for Tahajjud before Fajr\n• Perfect time for Quran recitation",
            "Dhuhr": "• Take a break from work\n• Remember Allah before prayer",
            "Asr": "• Don't delay Asr prayer\n• Make dua before sunset",
            "Maghrib": "• Break fast if fasting\n• Pray quickly after sunset",
            "Isha": "• Perfect for night prayers\n• Great time for reflection"
          };
          
          if (prayerTips[nextPrayer.name]) {
            message += `│ ${prayerTips[nextPrayer.name]}\n`;
          }
        }
        message += `└─────────────────────────────┘\n\n`;
      }
      
      // Location and Method Info
      message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `📍 𝗟𝗼𝗰𝗮𝘁𝗶𝗼𝗻 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻\n`;
      message += `• Coordinates: ${location.latitude.toFixed(4)}°N, ${location.longitude.toFixed(4)}°E\n`;
      message += `• Timezone: ${location.timezone}\n`;
      message += `• Calculation: ${location.method}\n\n`;
      
      // Footer
      message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `📌 Note: Always verify with local mosque\n`;
      message += `🤲 May Allah accept our prayers (Ameen)\n`;
      message += `⚡ Powered by: ${data.operator}\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      
      // Delete waiting message and send final result
      await api.deleteMessage(waitingMsg.messageID);
      
      return api.sendMessage(message, event.threadID, event.messageID);
      
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      
      let errorMessage = `╔════════════════════════════════╗\n`;
      errorMessage += `║        ❌ 𝗘𝗥𝗥𝗢𝗥        ║\n`;
      errorMessage += `╚════════════════════════════════╝\n\n`;
      
      if (error.response) {
        errorMessage += `⚠️ API Error: ${error.response.status}\n`;
        if (error.response.status === 404) {
          errorMessage += `• Location not found\n`;
          errorMessage += `• Check city/country spelling\n`;
        }
      } else if (error.request) {
        errorMessage += `🌐 Network Error\n`;
        errorMessage += `• Could not reach server\n`;
        errorMessage += `• Check your internet\n`;
      } else {
        errorMessage += `🔧 Error: ${error.message}\n`;
      }
      
      errorMessage += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      errorMessage += `📌 𝗖𝗢𝗥𝗥𝗘𝗖𝗧 𝗙𝗢𝗥𝗠𝗔𝗧:\n`;
      errorMessage += `• ${this.config.name} [city] [country]\n\n`;
      
      errorMessage += `📍 𝗣𝗢𝗣𝗨𝗟𝗔𝗥 𝗘𝗫𝗔𝗠𝗣𝗟𝗘𝗦:\n`;
      errorMessage += `├─────────────────────────────┤\n`;
      errorMessage += `│ • .namaz Dhaka Bangladesh   │\n`;
      errorMessage += `│ • .namaz Karachi Pakistan   │\n`;
      errorMessage += `│ • .namaz London UK          │\n`;
      errorMessage += `└─────────────────────────────┘\n\n`;
      
      errorMessage += `🤲 Try again with correct format...`;
      
      return api.sendMessage(errorMessage, event.threadID, event.messageID);
    }
  }
};

fetch('https://api.open-meteo.com/v1/forecast?latitude=57.71&longitude=11.97&hourly=temperature_2m,rain,snowfall,snow_depth,cloudcover,visibility,windspeed_120m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,rain_sum,snowfall_sum,windspeed_10m_max&windspeed_unit=ms&timezone=Europe%2FBerlin&past_days=1')
  .then(res => res.json())
  .then( data =>  {
    console.log(data);
    date.innerHTML = data.daily.time[1];
    temp.innerHTML = data.daily.temperature_2m_max[1] + data.daily_units.temperature_2m_max;
    sunrise.innerHTML = data.daily.sunrise[1].substring(11);
    sunset.innerHTML = data.daily.sunset[1].substring(11);
  });

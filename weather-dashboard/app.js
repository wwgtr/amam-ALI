// app.js — uses Open-Meteo geocoding + forecast (no API key)
// Features: search -> geocode -> fetch current + daily -> render

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const suggestionsEl = document.getElementById('suggestions');
const cityNameEl = document.getElementById('cityName');
const tempValueEl = document.getElementById('tempValue');
const descEl = document.getElementById('desc');
const windEl = document.getElementById('wind');
const timeEl = document.getElementById('time');
const weatherIconEl = document.getElementById('weatherIcon');
const forecastEl = document.getElementById('forecast');
const toastEl = document.getElementById('toast');
const unitToggle = document.getElementById('unitToggle');
const saveBtn = document.getElementById('saveBtn');

let currentUnit = 'C'; // 'C' or 'F'
let lastGeo = null;

// small mapping of Open-Meteo weathercode -> emoji + text
const weatherMap = {
  0: {icon:'☀️', text:'صافٍ'},
  1: {icon:'🌤️', text:'قليل السحب'},
  2: {icon:'⛅', text:'غالباً غائم'},
  3: {icon:'☁️', text:'غائم'},
  45: {icon:'🌫️', text:'ضباب'},
  48: {icon:'🌫️', text:'ضباب'},
  51: {icon:'🌦️', text:'رذاذ خفيف'},
  53: {icon:'🌦️', text:'رذاذ'},
  55: {icon:'🌧️', text:'رذاذ كثيف'},
  61: {icon:'🌧️', text:'مطر خفيف'},
  63: {icon:'🌧️', text:'مطر'},
  65: {icon:'🌧️', text:'مطر غزير'},
  71: {icon:'🌨️', text:'ثلج خفيف'},
  73: {icon:'🌨️', text:'ثلج'},
  75: {icon:'🌨️', text:'ثلج غزير'},
  80: {icon:'⛈️', text:'زخات مطر'},
  81: {icon:'⛈️', text:'زخات مطر قوية'},
  82: {icon:'⛈️', text:'زخات عنيفة'},
  95: {icon:'🌩️', text:'عاصفة رعدية'},
  96: {icon:'🌩️', text:'عاصفة رعدية مع برد'},
  99: {icon:'🌩️', text:'عاصفة رعدية مع برد'}
};

function showToast(msg, time = 2500){
  toastEl.textContent = msg;
  toastEl.style.display = 'block';
  setTimeout(()=>{ toastEl.style.display = 'none'; }, time);
}

function cToF(c){ return (c * 9/5) + 32; }
function formatTemp(tC){
  if (currentUnit === 'C') return `${Math.round(tC)}°C`;
  return `${Math.round(cToF(tC))}°F`;
}

async function geocode(query){
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  return data.results || [];
}

async function fetchWeather(lat, lon){
  // request current weather + daily
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('Weather fetch failed');
  return await res.json();
}

function renderCurrent(locationLabel, weather){
  cityNameEl.textContent = locationLabel;
  const tempC = weather.temperature;
  tempValueEl.textContent = formatTemp(tempC);
  const code = weather.weathercode;
  const info = weatherMap[code] || {icon:'🌤️', text:'—'};
  weatherIconEl.textContent = info.icon;
  descEl.textContent = info.text;
  windEl.textContent = `سرعة الرياح: ${Math.round(weather.windspeed)} كم/س`;
  // time local
  timeEl.textContent = `آخر تحديث: ${new Date(weather.time).toLocaleString()}`;
}

function renderForecast(daily){
  forecastEl.innerHTML = '';
  const days = daily.time.map((d,i) => {
    return {
      day: new Date(d).toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'}),
      max: daily.temperature_2m_max[i],
      min: daily.temperature_2m_min[i],
      code: daily.weathercode[i]
    };
  });
  days.forEach(d=>{
    const card = document.createElement('div');
    card.className = 'forecast-card';
    const icon = weatherMap[d.code] ? weatherMap[d.code].icon : '🌤️';
    card.innerHTML = `
      <div class="day">${d.day}</div>
      <div class="mini-icon">${icon}</div>
      <div class="temps">${formatTemp(d.max)} / ${formatTemp(d.min)}</div>
    `;
    forecastEl.appendChild(card);
  });
}

async function searchAndShow(query){
  try{
    showToast('جاري البحث...');
    const results = await geocode(query);
    if(!results.length) { showToast('لا توجد نتائج'); return; }
    // pick first result
    const place = results[0];
    lastGeo = place;
    const lat = place.latitude, lon = place.longitude;
    const label = [place.name, place.admin1, place.country].filter(Boolean).join(', ');
    const weatherData = await fetchWeather(lat, lon);
    if(weatherData.current_weather){
      renderCurrent(label, weatherData.current_weather);
    } else {
      tempValueEl.textContent = 'N/A';
    }
    if(weatherData.daily){
      renderForecast(weatherData.daily);
    }
    showToast('تم التحديث');
  }catch(err){
    console.error(err);
    showToast('خطأ في جلب الطقس');
  }
}

// suggestions (simple)
let suggestionDelay = null;
searchInput.addEventListener('input', async (e)=>{
  const q = e.target.value.trim();
  clearTimeout(suggestionDelay);
  suggestionsEl.innerHTML = '';
  if(!q) return;
  suggestionDelay = setTimeout(async ()=>{
    try{
      const items = await geocode(q);
      suggestionsEl.innerHTML = '';
      items.slice(0,6).forEach(item=>{
        const el = document.createElement('div');
        el.className = 'suggestion-item';
        el.tabIndex = 0;
        el.setAttribute('role','option');
        el.textContent = `${item.name}${item.admin1 ? ', '+item.admin1 : ''} — ${item.country}`;
        el.addEventListener('click', ()=> {
          searchInput.value = item.name;
          suggestionsEl.innerHTML = '';
          searchAndShow(item.name);
        });
        el.addEventListener('keydown', (ev) => {
          if(ev.key === 'Enter') el.click();
        });
        suggestionsEl.appendChild(el);
      });
    }catch(e){
      // ignore suggestions errors
    }
  }, 350);
});

searchBtn.addEventListener('click', ()=> {
  const q = searchInput.value.trim();
  if(!q) { showToast('اكتب اسم مدينة'); return; }
  searchAndShow(q);
});

// Enter in input triggers search
searchInput.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter') { e.preventDefault(); searchBtn.click(); }
  if(e.key === 'ArrowDown'){ // focus first suggestion
    const first = suggestionsEl.querySelector('.suggestion-item');
    if(first) first.focus();
  }
});

// unit toggle
unitToggle.addEventListener('click', ()=>{
  currentUnit = currentUnit === 'C' ? 'F' : 'C';
  unitToggle.setAttribute('aria-pressed', currentUnit === 'F');
  // re-render using stored last data if present
  if (lastGeo){
    searchAndShow(lastGeo.name);
  }
});

// Improved save using html2canvas for accurate capture with styles
saveBtn.addEventListener('click', async ()=>{
  try {
    const target = document.querySelector('.panel');
    if (!window.html2canvas) {
      showToast('مكتبة الحفظ غير مُحمّلة');
      return;
    }
    showToast('جارٍ تجهيز الصورة...');
    const canvas = await window.html2canvas(target, {backgroundColor: null, scale: 2, useCORS: true});
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `weather-${(cityNameEl.textContent||'city').replace(/\s+/g,'_')}.png`;
    link.click();
    showToast('تم حفظ الصورة');
  } catch(e){
    console.error(e);
    showToast('حصل خطأ في الحفظ');
  }
});

// initial example: show Cairo
window.addEventListener('load', ()=> {
  const saved = localStorage.getItem('lastCity') || 'Cairo';
  searchInput.value = saved;
  searchAndShow(saved);
});

// store last successful
function storeLast(city){
  try{ localStorage.setItem('lastCity', city); }catch(e){}
}

// wrap searchAndShow to store last
const _searchAndShow = searchAndShow;
searchAndShow = async (q)=>{
  await _searchAndShow(q);
  storeLast(q);
};

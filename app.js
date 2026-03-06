// app.js (Offline-Variante ohne devices.json)

const AVAILABLE = 27; // <-- HIER die Zahl ändern

let map, marker;

function initAvailability() {
  const el = document.getElementById("availableCount");
  if (el) el.textContent = String(AVAILABLE);
}

function initMap() {
  map = L.map("map", { zoomControl: true }).setView([47.0707, 15.4395], 9); // Graz

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);
}

function clearResults() {
  const r = document.getElementById("results");
  if (r) r.innerHTML = "";
}

function setMarker(lat, lon, label) {
  if (marker) marker.remove();
  marker = L.marker([lat, lon]).addTo(map);
  marker.bindPopup(label).openPopup();
}

async function searchAddress(query) {
  clearResults();
  if (!query || query.trim().length < 3) return;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  url.searchParams.set("q", query);

  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  const results = await res.json();

  const box = document.getElementById("results");
  if (!box) return;

  if (!results.length) {
    box.innerHTML = `<div class="result-item">Keine Treffer.</div>`;
    return;
  }

  results.forEach((r) => {
    const item = document.createElement("div");
    item.className = "result-item";
    item.textContent = r.display_name;

    item.addEventListener("click", () => {
      const lat = Number(r.lat),
        lon = Number(r.lon);
      map.flyTo([lat, lon], 16, { animate: true, duration: 1.2 });
      setMarker(lat, lon, r.display_name);
      clearResults();
    });

    box.appendChild(item);
  });
}

function wireUI() {
  const input = document.getElementById("searchInput");
  const btn = document.getElementById("searchBtn");

  if (btn && input) {
    btn.addEventListener("click", () => searchAddress(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") searchAddress(input.value);
      if (e.key === "Escape") clearResults();
    });
  }

  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      clearResults();
      if (input) input.value = "";
      if (marker) marker.remove();
      marker = null;
      map.flyTo([47.0707, 15.4395], 9, { animate: true, duration: 1.0 });
    });
  }

  const tourBtn = document.getElementById("tourBtn");
  if (tourBtn) {
    tourBtn.addEventListener("click", async () => {
      const stops = [
        { lat: 47.0707, lon: 15.4395, z: 12, label: "Graz" },
        { lat: 47.0833, lon: 15.4167, z: 15, label: "Innenstadt (Demo)" },
        { lat: 47.0977, lon: 15.4584, z: 16, label: "Punkt (Demo)" },
      ];

      for (const s of stops) {
        map.flyTo([s.lat, s.lon], s.z, { animate: true, duration: 1.6 });
        setMarker(s.lat, s.lon, s.label);
        await new Promise((r) => setTimeout(r, 1900));
      }
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  initAvailability();
  initMap();
  wireUI();
});

// public/js/location.js
async function getLocationInfo(apiKey, refresh=false) {
    const cached = localStorage.getItem("locationData");
    if (cached && !refresh) {
      const { country, county } = JSON.parse(cached);
      displayLocation(country, county, true);
      return;
    }
  
    if (!navigator.geolocation) {
      displayMessage("Geolocation not supported.");
      return;
    }
  
    navigator.geolocation.getCurrentPosition(async position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
  
      try {
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`
        );
        const data = await response.json();
  
        if (data && data.results.length > 0) {
          const components = data.results[0].components;
          const country = components.country || "Unknown";
          const state = components.state || "Unknown";
          const county = components.county || components.state_district || "Unknown";
  
          const locationData = { country, state, county };
          storeLocation(locationData);
          localStorage.setItem("locationData", JSON.stringify(locationData));
          displayLocation(country, county);
        } else {
          displayMessage("Could not determine location.");
        }
      } catch (err) {
        console.error(err);
        displayMessage("Error fetching location.");
      }
    }, error => {
      displayMessage("Geolocation error: " + error.message);
    });
  }
  
  function displayLocation(country, county, fromCache = false) {
    const source = fromCache ? " (from cache)" : "";
    document.getElementById("location-output").innerText =
      `${county}, ${country}`;
  }
  
  function displayMessage(msg) {
    document.getElementById("location-output").innerText = msg;
  }

  function storeLocation(locationData){
    fetch('/storage/set-storage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: 'locationData',
        data: locationData
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Server response:', data);
      })
      .catch(error => {
        console.error('Error sending location data:', error);
      });
    
  }
  
  // Export for direct use in <script type="module">
  export { getLocationInfo };
  
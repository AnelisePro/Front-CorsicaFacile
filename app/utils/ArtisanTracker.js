class ArtisanTracker {
  constructor(artisanId, apiUrl) {
    this.artisanId = artisanId;
    this.apiUrl = apiUrl;
    this.pageStart = Date.now();
    this.hasTrackedView = false;
    this.sessionId = this.getOrCreateSessionId();
    
    // Tracker la vue automatiquement
    this.trackView();
  }
  
  getOrCreateSessionId() {
    let sessionId = localStorage.getItem('visitor_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('visitor_session_id', sessionId);
    }
    return sessionId;
  }
  
  async trackView() {
    if (this.hasTrackedView) return;
    
    try {
      const location = await this.getLocation();
      const sessionStart = localStorage.getItem('session_start') || Date.now().toString();
      
      await fetch(`${this.apiUrl}/api/v1/tracking/artisans/${this.artisanId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          location: location,
          device_type: this.getDeviceType(),
          referrer: document.referrer,
          user_agent: navigator.userAgent,
          session_start: sessionStart
        }),
      });
      
      this.hasTrackedView = true;
      localStorage.setItem('session_start', sessionStart);
    } catch (error) {
      console.error('Tracking error:', error);
    }
  }
  
  async trackContact() {
    try {
      const timeOnPage = Date.now() - this.pageStart;
      
      await fetch(`${this.apiUrl}/api/v1/tracking/artisans/${this.artisanId}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          time_on_page: timeOnPage
        }),
      });
    } catch (error) {
      console.error('Tracking contact error:', error);
    }
  }
  
  getDeviceType() {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }
  
  // Géolocalisation complète avec GPS prioritaire
  async getLocation() {
    try {
      console.log('🌍 Tentative de géolocalisation GPS...');
      
      // 1️⃣ D'abord essayer la géolocalisation GPS du navigateur
      const browserLocation = await this.getBrowserLocation();
      if (browserLocation) {
        console.log('📍 Position GPS obtenue:', browserLocation);
        const preciseLocation = await this.reverseGeocode(browserLocation.latitude, browserLocation.longitude);
        if (preciseLocation) {
          console.log('✅ Géolocalisation GPS réussie:', preciseLocation);
          return preciseLocation;
        }
      }
      
      // Fallback sur géolocalisation IP
      console.log('🔄 Fallback vers géolocalisation IP...');
      return await this.getLocationFromIP();
      
    } catch (error) {
      console.warn('❌ Erreur géolocalisation:', error);
      return 'Localisation inconnue';
    }
  }
  
  // Obtenir la position GPS du navigateur
  getBrowserLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('❌ Géolocalisation non supportée');
        resolve(null);
        return;
      }
      
      const options = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 secondes
        maximumAge: 300000 // Cache 5 minutes
      };
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ GPS obtenu:', position.coords);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('❌ GPS refusé/échoué:', error.message);
          resolve(null);
        },
        options
      );
    });
  }
  
  // Convertir coordonnées GPS en nom de ville
  async reverseGeocode(lat, lng) {
    try {
      console.log(`🔍 Reverse geocoding: ${lat}, ${lng}`);
      
      // Utilisation du proxy Rails au lieu de l'API directe
      const response = await Promise.race([
        fetch(`${this.apiUrl}/api/v1/tracking/reverse_geocode?lat=${lat}&lon=${lng}`, {
          headers: {
            'Content-Type': 'application/json',
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 8000)
        )
      ]);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🗺️ Données reverse geocoding:', data);
        
        if (data.location) {
          console.log('✅ Ville trouvée:', data.location);
          return data.location;
        }
      }
      
      console.log('❌ Reverse geocoding échoué');
      return null;
      
    } catch (error) {
      console.warn('❌ Erreur reverse geocoding:', error);
      return null;
    }
  }
  
  // Géolocalisation par IP (fallback)
  async getLocationFromIP() {
    const apis = [
      {
        url: 'https://ipapi.co/json/',
        parser: (data) => data.city && data.region ? `${data.city}, ${data.region}` : null
      },
      {
        url: 'http://ip-api.com/json/?fields=city,regionName,status',
        parser: (data) => data.status === 'success' && data.city ? `${data.city}, ${data.regionName}` : null
      }
    ];
    
    for (const api of apis) {
      try {
        console.log(`🌐 Tentative API IP: ${api.url}`);
        
        const response = await Promise.race([
          fetch(api.url),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📡 Données API IP:', data);
          
          const location = api.parser(data);
          if (location) {
            console.log('✅ Géolocalisation IP réussie:', location);
            return location;
          }
        }
        
      } catch (error) {
        console.warn(`❌ API ${api.url} échouée:`, error);
        continue;
      }
    }
    
    console.log('❌ Toutes les APIs IP ont échoué');
    return 'Localisation inconnue';
  }
}

export default ArtisanTracker;


/**
 * City Manager - Handles dynamic city loading from Supabase database
 */
class CityManager {
    constructor(supabaseClient) {
        this.client = supabaseClient;
        this.cities = [];
        this.currentCity = null;
        this.defaultCity = null;
    }

    /**
     * Initialize city manager by loading cities from database
     */
    async initialize() {
        try {
            await this.loadCitiesFromDatabase();
            this.setDefaultCity();
            return { success: true };
        } catch (error) {
            console.error('City manager initialization failed:', error);
            this.loadFallbackCities();
            return { success: false, error: error.message };
        }
    }

    /**
     * Load cities from Supabase database
     */
    async loadCitiesFromDatabase() {
        const { data, error } = await this.client
            .from('cities')
            .select('*')
            .order('name');

        if (error) {
            throw new Error(`Failed to load cities: ${error.message}`);
        }

        if (!data || data.length === 0) {
            throw new Error('No cities found in database');
        }

        this.cities = data.map(city => ({
            id: city.id,
            key: city.name.toLowerCase().replace(/\s+/g, ''),
            name: city.name,
            state: city.state,
            country: city.country,
            displayName: `${city.name}, ${city.state}`,
            coordinates: {
                lat: parseFloat(city.latitude),
                lng: parseFloat(city.longitude),
                zoom: city.zoom_level || 11
            },
            hasSlumData: city.slum_data_available,
            hasPOIData: city.poi_data_available,
            processingDate: city.processing_date
        }));

        console.log(`Loaded ${this.cities.length} cities from database`);
    }

    /**
     * Fallback to hardcoded cities if database fails
     */
    loadFallbackCities() {
        console.warn('Loading fallback cities due to database error');
        this.cities = [
            {
                id: 1,
                key: 'mumbai',
                name: 'Mumbai',
                state: 'Maharashtra',
                displayName: 'Mumbai, Maharashtra',
                coordinates: { lat: 19.0760, lng: 72.8777, zoom: 11 },
                hasSlumData: true,
                hasPOIData: true
            },
            {
                id: 2,
                key: 'delhi',
                name: 'Delhi',
                state: 'Delhi',
                displayName: 'New Delhi, Delhi',
                coordinates: { lat: 28.6139, lng: 77.2090, zoom: 10 },
                hasSlumData: true,
                hasPOIData: true
            },
            {
                id: 3,
                key: 'bangalore',
                name: 'Bangalore',
                state: 'Karnataka',
                displayName: 'Bengaluru, Karnataka',
                coordinates: { lat: 12.9716, lng: 77.5946, zoom: 11 },
                hasSlumData: true,
                hasPOIData: true
            },
            {
                id: 4,
                key: 'kolkata',
                name: 'Kolkata',
                state: 'West Bengal',
                displayName: 'Kolkata, West Bengal',
                coordinates: { lat: 22.5726, lng: 88.3639, zoom: 11 },
                hasSlumData: true,
                hasPOIData: true
            },
            {
                id: 5,
                key: 'chennai',
                name: 'Chennai',
                state: 'Tamil Nadu',
                displayName: 'Chennai, Tamil Nadu',
                coordinates: { lat: 13.0827, lng: 80.2707, zoom: 11 },
                hasSlumData: true,
                hasPOIData: true
            }
        ];
    }

    /**
     * Set the default city (Mumbai first, then any city with slum data, then first city)
     */
    setDefaultCity() {
        const mumbai = this.cities.find(city => city.key === 'mumbai');
        const cityWithSlumData = this.cities.find(city => city.hasSlumData);
        this.defaultCity = mumbai || cityWithSlumData || this.cities[0];
        this.currentCity = this.defaultCity;
        console.log(`Default city set to: ${this.defaultCity.displayName}`);
    }

    /**
     * Get all available cities
     */
    getCities() {
        return this.cities;
    }

    /**
     * Get current city
     */
    getCurrentCity() {
        return this.currentCity;
    }

    /**
     * Get default city
     */
    getDefaultCity() {
        return this.defaultCity;
    }

    /**
     * Get city by key
     */
    getCityByKey(key) {
        return this.cities.find(city => city.key === key);
    }

    /**
     * Get city by ID
     */
    getCityById(id) {
        return this.cities.find(city => city.id === id);
    }

    /**
     * Set current city
     */
    setCurrentCity(cityKey) {
        const city = this.getCityByKey(cityKey);
        if (city) {
            this.currentCity = city;
            console.log(`Current city changed to: ${city.displayName}`);
            return city;
        }
        console.warn(`City not found: ${cityKey}`);
        return null;
    }

    /**
     * Get city coordinates for map centering
     */
    getCityCoordinates(cityKey = null) {
        const city = cityKey ? this.getCityByKey(cityKey) : this.currentCity;
        return city ? city.coordinates : this.defaultCity.coordinates;
    }

    /**
     * Generate city coordinates object for backward compatibility
     */
    getCityCoordinatesObject() {
        const coordinates = {};
        this.cities.forEach(city => {
            coordinates[city.key] = city.coordinates;
        });
        return coordinates;
    }

    /**
     * Check if city has specific data type
     */
    cityHasData(cityKey, dataType) {
        const city = this.getCityByKey(cityKey);
        if (!city) return false;
        
        switch (dataType) {
            case 'slum':
                return city.hasSlumData;
            case 'poi':
                return city.hasPOIData;
            default:
                return false;
        }
    }

    /**
     * Add or update city in database
     */
    async addCity(cityData) {
        try {
            const { data, error } = await this.client
                .from('cities')
                .upsert([{
                    name: cityData.name,
                    state: cityData.state,
                    country: cityData.country || 'India',
                    latitude: cityData.latitude,
                    longitude: cityData.longitude,
                    zoom_level: cityData.zoomLevel || 11,
                    is_processed: cityData.isProcessed || false,
                    slum_data_available: cityData.hasSlumData || false,
                    poi_data_available: cityData.hasPOIData || false,
                    processing_date: cityData.processingDate || new Date().toISOString()
                }])
                .select();

            if (error) throw error;

            // Reload cities to include the new one
            await this.loadCitiesFromDatabase();
            
            return { success: true, data };
        } catch (error) {
            console.error('Failed to add city:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update city processing status
     */
    async updateCityStatus(cityId, statusData) {
        try {
            const { data, error } = await this.client
                .from('cities')
                .update({
                    is_processed: statusData.isProcessed,
                    slum_data_available: statusData.hasSlumData,
                    poi_data_available: statusData.hasPOIData,
                    processing_date: statusData.processingDate || new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', cityId)
                .select();

            if (error) throw error;

            // Reload cities to reflect changes
            await this.loadCitiesFromDatabase();
            
            return { success: true, data };
        } catch (error) {
            console.error('Failed to update city status:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CityManager;
}

/**
 * POI Index Manager
 * 
 * Manages spatial indices for Points of Interest (schools, toilets, landfills)
 * to enable fast viewport-based filtering and efficient rendering.
 */

class POIIndexManager {
    constructor() {
        this.indices = new Map();
        this.masterIndex = null;
        this.gridSize = 0.005; // Will be updated from master index
        this.loadedIndices = new Set();
    }

    /**
     * Initialize the POI index system
     */
    async initialize() {
        try {
            console.log('Initializing POI Index Manager...');
            
            // Load master index
            const response = await fetch('static_data/indices/poi_master_index.json', { 
                cache: 'no-store' 
            });
            
            if (!response.ok) {
                throw new Error(`Failed to load master index: ${response.status}`);
            }
            
            this.masterIndex = await response.json();
            this.gridSize = this.masterIndex.metadata.grid_size;
            
            console.log(`POI Index Manager initialized with grid size: ${this.gridSize}`);
            console.log(`Available POI types: ${this.masterIndex.metadata.available_indices.join(', ')}`);
            
            return true;
        } catch (error) {
            console.warn('POI Index Manager initialization failed:', error);
            return false;
        }
    }

    /**
     * Load index for a specific POI type
     */
    async loadIndex(poiType) {
        if (this.loadedIndices.has(poiType)) {
            return this.indices.get(poiType);
        }

        if (!this.masterIndex) {
            throw new Error('POI Index Manager not initialized');
        }

        const indexFile = this.masterIndex.poi_types[poiType];
        if (!indexFile) {
            throw new Error(`Unknown POI type: ${poiType}`);
        }

        try {
            console.log(`Loading ${poiType} index...`);
            
            const response = await fetch(`static_data/indices/${indexFile}`, { 
                cache: 'no-store' 
            });
            
            if (!response.ok) {
                throw new Error(`Failed to load ${poiType} index: ${response.status}`);
            }
            
            const indexData = await response.json();
            this.indices.set(poiType, indexData);
            this.loadedIndices.add(poiType);
            
            console.log(`Loaded ${poiType} index: ${indexData.metadata.feature_count} features across ${indexData.metadata.grid_cells} grid cells`);
            
            return indexData;
        } catch (error) {
            console.error(`Failed to load ${poiType} index:`, error);
            throw error;
        }
    }

    /**
     * Get grid cell key for coordinates
     */
    getGridCell(lat, lng) {
        const gridLat = Math.floor(lat / this.gridSize);
        const gridLng = Math.floor(lng / this.gridSize);
        return `${gridLat},${gridLng}`;
    }

    /**
     * Get all grid cells that intersect with a bounding box
     */
    getGridCellsInBounds(bounds) {
        const { north, south, east, west } = bounds;
        
        const minGridLat = Math.floor(south / this.gridSize);
        const maxGridLat = Math.floor(north / this.gridSize);
        const minGridLng = Math.floor(west / this.gridSize);
        const maxGridLng = Math.floor(east / this.gridSize);
        
        const cells = [];
        for (let gridLat = minGridLat; gridLat <= maxGridLat; gridLat++) {
            for (let gridLng = minGridLng; gridLng <= maxGridLng; gridLng++) {
                cells.push(`${gridLat},${gridLng}`);
            }
        }
        
        return cells;
    }

    /**
     * Query POI features within viewport bounds
     */
    async queryPOIsInBounds(poiType, bounds) {
        // Ensure index is loaded
        const index = await this.loadIndex(poiType);
        
        // Get relevant grid cells
        const gridCells = this.getGridCellsInBounds(bounds);
        
        // Collect features from relevant grid cells
        const features = [];
        const seenIds = new Set(); // Avoid duplicates
        
        for (const cellKey of gridCells) {
            const cellFeatures = index.grid_index[cellKey];
            if (cellFeatures) {
                for (const feature of cellFeatures) {
                    if (!seenIds.has(feature.id)) {
                        // Additional bounds check for precision
                        const [lng, lat] = feature.coordinates;
                        if (lat >= bounds.south && lat <= bounds.north && 
                            lng >= bounds.west && lng <= bounds.east) {
                            features.push(feature);
                            seenIds.add(feature.id);
                        }
                    }
                }
            }
        }
        
        return features;
    }

    /**
     * Create GeoJSON from indexed features
     */
    createGeoJSONFromFeatures(features) {
        return {
            type: 'FeatureCollection',
            features: features.map(feature => ({
                type: 'Feature',
                properties: {
                    id: feature.id,
                    name: feature.name,
                    amenity: feature.amenity,
                    landuse: feature.landuse
                },
                geometry: {
                    type: feature.type,
                    coordinates: feature.coordinates
                }
            }))
        };
    }

    /**
     * Get POI statistics for a given bounds
     */
    async getPOIStats(bounds) {
        const stats = {};
        
        for (const poiType of this.masterIndex.metadata.available_indices) {
            try {
                const features = await this.queryPOIsInBounds(poiType, bounds);
                stats[poiType] = {
                    count: features.length,
                    visible: features.length > 0
                };
            } catch (error) {
                console.warn(`Failed to get stats for ${poiType}:`, error);
                stats[poiType] = { count: 0, visible: false };
            }
        }
        
        return stats;
    }

    /**
     * Get bounds from map viewport
     */
    getMapBounds(map) {
        const bounds = map.getBounds();
        return {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
        };
    }

    /**
     * Check if POI type is available
     */
    isAvailable(poiType) {
        return this.masterIndex && 
               this.masterIndex.metadata.available_indices.includes(poiType);
    }

    /**
     * Get all available POI types
     */
    getAvailablePOITypes() {
        return this.masterIndex ? 
               [...this.masterIndex.metadata.available_indices] : 
               [];
    }

    /**
     * Clear loaded indices (for memory management)
     */
    clearIndices() {
        this.indices.clear();
        this.loadedIndices.clear();
        console.log('POI indices cleared from memory');
    }
}

// Create global instance
window.poiIndexManager = new POIIndexManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = POIIndexManager;
}

#!/usr/bin/env python3
"""
POI Index Generator

This script processes GeoJSON files containing schools, landfills, and toilets
to create spatial indices for faster querying and rendering.

The index uses a spatial grid system to organize POI data by geographic regions,
allowing for efficient spatial queries and viewport-based filtering.
"""

import json
import math
import os
from typing import Dict, List, Tuple, Any
from collections import defaultdict

class POIIndexer:
    def __init__(self, grid_size: float = 0.01):
        """
        Initialize the POI indexer.
        
        Args:
            grid_size: Size of each grid cell in degrees (default: 0.01 ≈ 1.1km)
        """
        self.grid_size = grid_size
        self.indices = {}
        
    def _get_grid_cell(self, lat: float, lng: float) -> Tuple[int, int]:
        """Get the grid cell coordinates for a given lat/lng."""
        grid_lat = int(lat / self.grid_size)
        grid_lng = int(lng / self.grid_size)
        return (grid_lat, grid_lng)
    
    def _get_bounds(self, geometry: Dict) -> Tuple[float, float, float, float]:
        """Get bounding box for a geometry (min_lat, min_lng, max_lat, max_lng)."""
        if geometry['type'] == 'Point':
            lng, lat = geometry['coordinates']
            return lat, lng, lat, lng
        elif geometry['type'] == 'MultiPolygon':
            all_coords = []
            for polygon in geometry['coordinates']:
                for ring in polygon:
                    all_coords.extend(ring)
            
            lats = [coord[1] for coord in all_coords]
            lngs = [coord[0] for coord in all_coords]
            return min(lats), min(lngs), max(lats), max(lngs)
        else:
            raise ValueError(f"Unsupported geometry type: {geometry['type']}")
    
    def _create_feature_summary(self, feature: Dict) -> Dict:
        """Create a lightweight summary of a feature for the index."""
        props = feature.get('properties', {})
        geom = feature['geometry']
        
        # Extract key identifying information
        summary = {
            'id': props.get('osm_id', props.get('full_id', 'unknown')),
            'type': geom['type'],
            'name': props.get('name', ''),
            'amenity': props.get('amenity', ''),
            'landuse': props.get('landuse', ''),
        }
        
        # Add coordinates based on geometry type
        if geom['type'] == 'Point':
            summary['coordinates'] = geom['coordinates']
        elif geom['type'] == 'MultiPolygon':
            # Store centroid for polygons
            bounds = self._get_bounds(geom)
            centroid_lat = (bounds[0] + bounds[2]) / 2
            centroid_lng = (bounds[1] + bounds[3]) / 2
            summary['coordinates'] = [centroid_lng, centroid_lat]
            summary['bounds'] = bounds
        
        return summary
    
    def process_geojson_file(self, filepath: str, poi_type: str) -> Dict:
        """
        Process a GeoJSON file and create spatial index.
        
        Args:
            filepath: Path to the GeoJSON file
            poi_type: Type of POI (schools, toilets, landfills)
            
        Returns:
            Dictionary containing the spatial index
        """
        print(f"Processing {poi_type} from {filepath}")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            geojson_data = json.load(f)
        
        # Initialize grid index
        grid_index = defaultdict(list)
        feature_count = 0
        
        # Process each feature
        for feature in geojson_data.get('features', []):
            try:
                geometry = feature['geometry']
                bounds = self._get_bounds(geometry)
                
                # Create feature summary
                feature_summary = self._create_feature_summary(feature)
                
                # Determine which grid cells this feature intersects
                min_lat, min_lng, max_lat, max_lng = bounds
                
                # Get grid cell range
                min_grid_lat, min_grid_lng = self._get_grid_cell(min_lat, min_lng)
                max_grid_lat, max_grid_lng = self._get_grid_cell(max_lat, max_lng)
                
                # Add feature to all intersecting grid cells
                for grid_lat in range(min_grid_lat, max_grid_lat + 1):
                    for grid_lng in range(min_grid_lng, max_grid_lng + 1):
                        grid_key = f"{grid_lat},{grid_lng}"
                        grid_index[grid_key].append(feature_summary)
                
                feature_count += 1
                
            except Exception as e:
                print(f"Error processing feature: {e}")
                continue
        
        # Create index metadata
        index_data = {
            'metadata': {
                'poi_type': poi_type,
                'grid_size': self.grid_size,
                'feature_count': feature_count,
                'grid_cells': len(grid_index),
                'source_file': os.path.basename(filepath)
            },
            'grid_index': dict(grid_index)
        }
        
        print(f"Created index for {feature_count} {poi_type} features across {len(grid_index)} grid cells")
        return index_data
    
    def generate_all_indices(self, geojson_dir: str, output_dir: str):
        """Generate indices for all POI types."""
        
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        # POI file mappings
        poi_files = {
            'schools': 'amenity_school_points.geojson',
            'toilets': 'amenity_toilets_points.geojson', 
            'landfills': 'landuse_landfill_multipolygons.geojson'
        }
        
        # Process each POI type
        for poi_type, filename in poi_files.items():
            filepath = os.path.join(geojson_dir, filename)
            
            if not os.path.exists(filepath):
                print(f"Warning: {filepath} not found, skipping {poi_type}")
                continue
            
            # Generate index
            index_data = self.process_geojson_file(filepath, poi_type)
            
            # Save index to file
            output_file = os.path.join(output_dir, f"{poi_type}_index.json")
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(index_data, f, indent=2, ensure_ascii=False)
            
            print(f"Saved {poi_type} index to {output_file}")
        
        # Create master index file
        master_index = {
            'metadata': {
                'grid_size': self.grid_size,
                'generated_at': None,  # Could add timestamp
                'available_indices': list(poi_files.keys())
            },
            'poi_types': {
                poi_type: f"{poi_type}_index.json" 
                for poi_type in poi_files.keys()
            }
        }
        
        master_file = os.path.join(output_dir, 'poi_master_index.json')
        with open(master_file, 'w', encoding='utf-8') as f:
            json.dump(master_index, f, indent=2, ensure_ascii=False)
        
        print(f"Created master index at {master_file}")

def main():
    """Main function to generate POI indices."""
    
    # Configuration
    geojson_dir = "static_data/geojson"
    output_dir = "static_data/indices"
    grid_size = 0.005  # Smaller grid for better granularity (≈ 550m)
    
    # Create indexer
    indexer = POIIndexer(grid_size=grid_size)
    
    # Generate all indices
    indexer.generate_all_indices(geojson_dir, output_dir)
    
    print("\nPOI index generation complete!")
    print(f"Indices saved to: {output_dir}")
    print(f"Grid size: {grid_size} degrees (≈ {grid_size * 111:.1f}km)")

if __name__ == "__main__":
    main()

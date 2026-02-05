#!/usr/bin/env python3
"""
Extract slum locations from TIFF prediction file and convert to GeoJSON format
for use in the web application.
"""

import rasterio
import numpy as np
from rasterio.transform import xy
from pyproj import Transformer
import json
from scipy import ndimage
import argparse

def extract_slum_locations(tiff_path, output_path, grid_size=50, min_confidence=0.5):
    """
    Extract slum probability grid from TIFF prediction file.
    
    Args:
        tiff_path: Path to the TIFF file
        output_path: Path to save the GeoJSON output
        grid_size: Size of grid cells in pixels for sampling
        min_confidence: Minimum confidence threshold for including points
    """
    
    with rasterio.open(tiff_path) as src:
        # Read the prediction data
        data = src.read(1)
        transform = src.transform
        crs = src.crs
        
        print(f"Data shape: {data.shape}")
        print(f"Unique values: {np.unique(data)}")
        print(f"Number of positive predictions: {np.sum(data == 1)}")
        
        # Create transformer to convert from UTM to WGS84 (lat/lon)
        transformer = Transformer.from_crs(crs, "EPSG:4326", always_xy=True)
        
        slum_locations = []
        location_id = 1
        
        # Sample the continuous prediction data on a regular grid
        for y in range(0, data.shape[0], grid_size):
            for x in range(0, data.shape[1], grid_size):
                # Extract grid cell
                y_end = min(y + grid_size, data.shape[0])
                x_end = min(x + grid_size, data.shape[1])
                grid_cell = data[y:y_end, x:x_end]
                
                # Calculate slum probability in this grid cell
                slum_pixels = np.sum(grid_cell == 1)
                total_pixels = grid_cell.size
                confidence = slum_pixels / total_pixels if total_pixels > 0 else 0
                
                # Skip cells with low slum probability
                if confidence < min_confidence:
                    continue
                
                # Use center of grid cell as representative point
                center_y = y + grid_size // 2
                center_x = x + grid_size // 2
                
                # Convert pixel coordinates to geographic coordinates
                geo_x, geo_y = xy(transform, center_y, center_x)
                
                # Transform from UTM to WGS84 (lat/lon)
                lon, lat = transformer.transform(geo_x, geo_y)
                
                # Estimate population based on slum density
                estimated_population = int(slum_pixels * 25)  # ~25 people per slum pixel
                
                slum_location = {
                    "id": location_id,
                    "lat": lat,
                    "lng": lon,
                    "confidence": confidence,
                    "slum_pixels": int(slum_pixels),
                    "grid_size": f"{grid_size}x{grid_size}",
                    "name": f"Grid Cell {location_id:03d}",
                    "city": "Mumbai",
                    "state": "Maharashtra",
                    "population": estimated_population,
                    "description": f"Grid cell with {confidence:.1%} slum probability ({slum_pixels}/{total_pixels} pixels)."
                }
                
                slum_locations.append(slum_location)
                location_id += 1
        
        print(f"Extracted {len(slum_locations)} grid cells with slum probability >= {min_confidence:.1%}")
        
        # Create GeoJSON structure
        geojson = {
            "type": "FeatureCollection",
            "features": []
        }
        
        for slum in slum_locations:
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [slum["lng"], slum["lat"]]
                },
                "properties": slum
            }
            geojson["features"].append(feature)
        
        # Save to file
        with open(output_path, 'w') as f:
            json.dump(geojson, f, indent=2)
        
        print(f"Saved {len(slum_locations)} locations to {output_path}")
        
        # Also save as JavaScript module for direct inclusion
        js_output = output_path.replace('.geojson', '.js')
        with open(js_output, 'w') as f:
            f.write("// Auto-generated slum data from TIFF predictions\n")
            f.write("const realSlumData = {\n")
            f.write("    mumbai: [\n")
            for slum in slum_locations:
                f.write(f"        {json.dumps(slum)},\n")
            f.write("    ]\n")
            f.write("};\n\n")
            f.write("// Export for use in main script\n")
            f.write("if (typeof module !== 'undefined' && module.exports) {\n")
            f.write("    module.exports = realSlumData;\n")
            f.write("}\n")
        
        print(f"Saved JavaScript module to {js_output}")
        
        return slum_locations

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract slum probability grid from TIFF prediction file")
    parser.add_argument("--input", default="pred_LightGBM (1).tif", help="Input TIFF file")
    parser.add_argument("--output", default="slum_data.geojson", help="Output GeoJSON file")
    parser.add_argument("--grid-size", type=int, default=50, help="Grid cell size in pixels")
    parser.add_argument("--min-confidence", type=float, default=0.5, help="Minimum confidence threshold")
    
    args = parser.parse_args()
    
    extract_slum_locations(args.input, args.output, grid_size=args.grid_size, min_confidence=args.min_confidence)

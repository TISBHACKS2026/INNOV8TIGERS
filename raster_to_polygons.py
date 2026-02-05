#!/usr/bin/env python3
"""
Convert a binary GeoTIFF (0 background, 1 foreground) into:
- slum_overlay.geojson: vector polygons in WGS84 for crisp, stable rendering
- slum_overlay.png + slum_overlay_bounds.json: static image overlay with WGS84 bounds

Usage:
  python3 raster_to_polygons.py \
      --input "pred_LightGBM (1).tif" \
      --out-geojson slum_overlay.geojson \
      --out-png slum_overlay.png \
      --out-bounds slum_overlay_bounds.json \
      --min-area 1000 --simplify 5

Notes:
- --min-area is in square meters (works best if input CRS is projected in meters, e.g. UTM)
- --simplify is in meters (Douglas-Peucker simplification); set 0 to disable
"""

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

import rasterio
from rasterio.features import shapes
from rasterio.warp import transform_bounds, transform_geom

# shapely is optional (for simplification and area filtering)
try:
    from shapely.geometry import shape as shp_shape, mapping as shp_mapping
    from shapely.ops import unary_union
    HAVE_SHAPELY = True
except Exception:
    HAVE_SHAPELY = False


def polygonize_binary_raster(src, min_area=0.0, simplify_tol=0.0):
    band = src.read(1)
    # Treat value==1 as foreground
    mask = band == 1

    print(f"Raster size: {src.width}x{src.height}, CRS={src.crs}")
    print(f"Positive pixels: {int(mask.sum())} ({mask.sum() / mask.size:.2%})")

    geoms = []
    # Generate vector polygons in native CRS
    for geom, val in shapes(band, mask=mask, transform=src.transform, connectivity=8):
        if int(val) != 1:
            continue
        geoms.append(geom)

    print(f"Extracted {len(geoms)} raw polygons")

    # If shapely is available, filter by area and simplify, and union to reduce fragments
    if HAVE_SHAPELY:
        polys = [shp_shape(g) for g in geoms]
        if min_area > 0:
            polys = [p for p in polys if p.area >= min_area]
        if simplify_tol > 0:
            polys = [p.simplify(simplify_tol, preserve_topology=True) for p in polys]
        if not polys:
            return []
        try:
            merged = unary_union(polys)
            # Explode to individual polygons
            if merged.geom_type == 'Polygon':
                polys = [merged]
            elif merged.geom_type == 'MultiPolygon':
                polys = list(merged.geoms)
            else:
                # Unexpected type; fallback to original polys
                pass
        except Exception:
            # Fallback to non-unioned polys
            pass
        # Convert to GeoJSON-like dicts in native CRS
        geoms = [shp_mapping(p) for p in polys]
    else:
        if min_area > 0 or simplify_tol > 0:
            print("Note: shapely not available; skipping area filter and simplification.")

    # Reproject to WGS84 for GeoJSON
    geoms_wgs84 = [
        transform_geom(src.crs, "EPSG:4326", g, precision=6)
        for g in geoms
    ]

    return geoms_wgs84


def save_geojson(geoms_wgs84, output_path):
    fc = {
        "type": "FeatureCollection",
        "features": [
            {"type": "Feature", "geometry": g, "properties": {"class": 1}}
            for g in geoms_wgs84
        ],
    }
    with open(output_path, "w") as f:
        json.dump(fc, f)
    print(f"Saved GeoJSON with {len(fc['features'])} features -> {output_path}")


def save_png_and_bounds(src, output_png, output_bounds):
    band = src.read(1)
    h, w = band.shape
    img = Image.new("RGBA", (w, h))
    arr = np.zeros((h, w, 4), dtype=np.uint8)
    # White where band==1, transparent otherwise
    arr[band == 1] = [255, 255, 255, 220]
    img = Image.fromarray(arr, mode="RGBA")
    img.save(output_png)
    print(f"Saved image overlay -> {output_png}")

    # Bounds in WGS84
    b = transform_bounds(src.crs, "EPSG:4326", *src.bounds)
    bounds_dict = {"west": b[0], "south": b[1], "east": b[2], "north": b[3]}
    with open(output_bounds, "w") as f:
        json.dump(bounds_dict, f)
    print(f"Saved image bounds -> {output_bounds}: {bounds_dict}")


def main():
    parser = argparse.ArgumentParser(description="Polygonize a binary GeoTIFF and/or export as image overlay")
    parser.add_argument("--input", required=True, help="Input binary GeoTIFF path")
    parser.add_argument("--out-geojson", default="slum_overlay.geojson", help="Output GeoJSON path")
    parser.add_argument("--out-png", default="slum_overlay.png", help="Output PNG overlay path")
    parser.add_argument("--out-bounds", default="slum_overlay_bounds.json", help="Output JSON with WGS84 bounds")
    parser.add_argument("--min-area", type=float, default=1000.0, help="Min polygon area in square meters (native CRS) to keep")
    parser.add_argument("--simplify", type=float, default=5.0, help="Simplification tolerance in native CRS units (meters if UTM)")
    parser.add_argument("--no-geojson", action="store_true", help="Skip GeoJSON export")
    parser.add_argument("--no-png", action="store_true", help="Skip PNG/bounds export")

    args = parser.parse_args()

    tif = Path(args.input)
    if not tif.exists():
        print(f"ERROR: Input not found: {tif}")
        sys.exit(1)

    with rasterio.open(tif) as src:
        # Polygonize -> GeoJSON
        if not args.no_geojson:
            geoms_wgs84 = polygonize_binary_raster(src, min_area=args.min_area, simplify_tol=args.simplify)
            save_geojson(geoms_wgs84, args.out_geojson)

        # PNG + bounds
        if not args.no_png:
            save_png_and_bounds(src, args.out_png, args.out_bounds)


if __name__ == "__main__":
    main()

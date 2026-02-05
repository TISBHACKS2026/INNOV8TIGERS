# Project Repository for TISBHACKS2026

## Urbis: The Smart City Planning Tool

**Urbis** is an AI-powered urban planning tool designed for cities of the Global South. It helps governments and urban bodies make data-driven, humane infrastructure decisions for underserved communities using freely available satellite imagery.

Urbis focuses on one of the most critical blind spots in urban governance: **informal settlements and slum infrastructure planning**.

---

## 🚩 Problem Statement

Many cities lack:
- Accurate, up-to-date maps of slum boundaries  
- Data-driven planning for essential public infrastructure  
- Tools that integrate spatial data with welfare planning  

As a result, welfare services are allocated ineffectively. Baseline study costs skyrocket, discouraging foreign investment into the city; and slum rehabilitation becomes much more difficult. Moreover, services like **public toilets, ration shops, and welfare canteens** are often placed inefficiently or excluded entirely from high-need areas.

---

## 💡 Solution

Urbis uses **AI-driven satellite image analysis** to:
1. **Detect and map slum boundaries**
2. **Visualize underserved regions**
3. **Recommend optimal locations** for:
   - Public toilets  
   - Welfare canteens / Ration Shops

All recommendations are based on **proximity, density, and accessibility** relative to detected slum areas.

---

## 🛰️ How It Works

### 1. Slum Boundary Detection
- Uses **free satellite imagery**
- Computer vision models identify high-density informal housing patterns
- Outputs polygonal slum boundaries on an interactive map

### 2. Spatial Analysis
- Calculates:
  - Population density clusters
  - Distance to existing public infrastructure
  - Walkability-based proximity metrics

### 3. Infrastructure Placement Engine
- Suggests optimal locations for new facilities by minimizing:
  - Walking distance
  - Service overlap
  - Infrastructure blind spots

### 4. Interactive Visualization
- Map-based UI for planners and policymakers
- Toggle layers:
  - Slum boundaries
  - Existing facilities
  - Proposed infrastructure points

---

## 🧠 Tech Stack

- **Satellite Imagery**: Open-source / freely available datasets  
- **AI / ML**:
  - Computer Vision for settlement detection
  - Spatial clustering algorithms
- **Mapping & Visualization**:
  - Interactive map rendering
  - Geospatial overlays
- **Backend Logic**:
  - Proximity analysis
  - Location optimization heuristics

*(Exact libraries and frameworks are modular and hackathon-friendly.)*

---

## 🌍 Impact

Urbis enables cities to:
- Make **evidence-based welfare decisions**
- Improve **public health and food security**
- Reduce **manual surveys and outdated records**
- Promote **equitable urban development**

This tool is especially relevant for rapidly urbanizing regions where traditional data collection is slow, expensive, or incomplete.

---

## 🚀 Use Cases

- Municipal corporations
- Smart city planning bodies
- Urban development authorities
- NGOs working in informal settlements

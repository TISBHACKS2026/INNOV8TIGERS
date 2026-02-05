// Guided Tour Configuration
const tourSteps = [
    {
        title: 'Welcome to the Map Tour',
        content: 'This quick tour will help you understand the key features of the map interface.',
        target: null,
        position: 'center'
    },
    {
        title: 'Map Navigation',
        content: 'Use the + and - buttons to zoom in and out. Click and drag to pan around the map.',
        target: '.leaflet-control-zoom',
        position: 'bottom'
    },
    {
        title: 'Threshold Control',
        content: 'Adjust this slider to change the confidence threshold for slum detection. Higher values show only the most certain areas.',
        target: '#thresholdSection',
        position: 'right'
    },
    {
        title: 'Overlay Controls',
        content: 'Toggle the overlay visibility and adjust its opacity to better see the underlying map.',
        target: '#overlayOpacity',
        position: 'right'
    },
    {
        title: 'Map Background',
        content: 'Adjust the background dim to make the overlay more or less prominent against the base map.',
        target: '#bgDimRange',
        position: 'right'
    },
    {
        title: 'Export Options',
        content: 'Export the current overlay as a TIFF file for further analysis in GIS software.',
        target: '#exportTiffBtn',
        position: 'left'
    },
    {
        title: 'Tour Complete',
        content: 'You\'re all set! You can restart this tour anytime by clicking the help button in the bottom-right corner.',
        target: null,
        position: 'center'
    }
];

let currentStep = 0;
let highlightedElement = null;

function startTour() {
    currentStep = 0;
    showStep(0);
    document.getElementById('tourModal').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Reposition on viewport changes
    if (!window._tourRepositionHandler) {
        window._tourRepositionHandler = () => {
            try { positionModalNearTarget(tourSteps[currentStep]); } catch (_) {}
        };
        window.addEventListener('resize', window._tourRepositionHandler);
        window.addEventListener('scroll', window._tourRepositionHandler, true);
    }
}

function endTour() {
    document.getElementById('tourModal').setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    removeHighlight();
    try { localStorage.setItem('tourCompleted', '1'); } catch (_) {}
    // Cleanup listeners
    if (window._tourRepositionHandler) {
        window.removeEventListener('resize', window._tourRepositionHandler);
        window.removeEventListener('scroll', window._tourRepositionHandler, true);
        window._tourRepositionHandler = null;
    }
}

function showStep(stepIndex) {
    const step = tourSteps[stepIndex];
    const modal = document.getElementById('tourModal');
    const modalContent = modal.querySelector('.modal-content');
    
    // Update modal content (map.html uses #tourBody)
    const bodyEl = modal.querySelector('#tourBody');
    if (bodyEl) {
        bodyEl.innerHTML = `
            <h3>${step.title}</h3>
            <p>${step.content}</p>
        `;
    } else {
        console.warn('Tour body container #tourBody not found');
    }
    
    // Base modal styles for popover
    modalContent.style.position = 'fixed';
    modalContent.style.left = '';
    modalContent.style.top = '';
    modalContent.style.right = '';
    modalContent.style.bottom = '';
    modalContent.style.transform = '';
    modalContent.style.width = '320px';
    modalContent.style.maxWidth = '90%';
    // Prepare for smooth appearance: hide until positioned
    modalContent.style.opacity = '0';

    // Highlight and ensure target visibility
    if (step.target) {
        const target = document.querySelector(step.target);
        if (target) {
            highlightElement(target);
            ensureTargetVisible(target);
        } else {
            removeHighlight();
        }
    } else {
        removeHighlight();
    }

    // Position modal near target (or center if none)
    positionModalNearTarget(step);

    // Smooth step animation AFTER positioning to avoid initial flicker
    try {
        modalContent.classList.remove('tour-step-anim');
        // Force reflow so class re-add animates
        void modalContent.offsetWidth;
        if (step.target) {
            modalContent.classList.add('tour-step-anim');
            modalContent.style.opacity = '1';
        } else {
            // Centered step: fade only to preserve translate centering
            requestAnimationFrame(() => { modalContent.style.opacity = '1'; });
        }
    } catch (_) {}

    // Update navigation button states
    try {
        const prevBtn = modal.querySelector('#tourPrev');
        const nextBtn = modal.querySelector('#tourNext');
        if (prevBtn) prevBtn.disabled = (stepIndex === 0);
        if (nextBtn) nextBtn.textContent = (stepIndex === tourSteps.length - 1) ? 'Finish' : 'Next';
    } catch (_) {}
}

// Scroll the target into view, including within scrollable containers like the sidebar
function ensureTargetVisible(target) {
    try {
        target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        const scroller = target.closest('.sidebar');
        if (scroller) {
            // Nudge scroll a bit to avoid being flush to edges
            const rect = target.getBoundingClientRect();
            const sRect = scroller.getBoundingClientRect();
            if (rect.top < sRect.top + 20 || rect.bottom > sRect.bottom - 20) {
                const delta = (rect.top + rect.height / 2) - (sRect.top + sRect.height / 2);
                scroller.scrollBy({ top: delta, behavior: 'smooth' });
            }
        }
    } catch (_) {}
}

// Compute and apply popover position relative to the current step's target
function positionModalNearTarget(step) {
  const modal = document.getElementById('tourModal');
  if (!modal) return;
  const modalContent = modal.querySelector('.modal-content');
  if (!modalContent) return;

    // Default: center if no target
  if (!step || !step.target) {
      modalContent.style.left = '50%';
      modalContent.style.top = '50%';
      modalContent.style.transform = 'translate(-50%, -50%)';
      return;
  }

  // Resolve the target element; if not found, fall back to centered modal
  const target = document.querySelector(step.target);
  if (!target) {
      modalContent.style.left = '50%';
      modalContent.style.top = '50%';
      modalContent.style.transform = 'translate(-50%, -50%)';
      return;
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const padding = 16;
  const gap = 12; // space between popover and target
  const rect = target.getBoundingClientRect();
  const mrect = modalContent.getBoundingClientRect();

  // Reset transform for absolute positioning
  modalContent.style.transform = '';

  // Helper to compute position by side
  function computeBySide(side) {
    let left, top;
    switch (side) {
      case 'top':
        left = rect.left + (rect.width / 2) - (mrect.width / 2);
        top = rect.top - mrect.height - gap;
        break;
      case 'bottom':
        left = rect.left + (rect.width / 2) - (mrect.width / 2);
        top = rect.bottom + gap;
        break;
      case 'left':
        left = rect.left - mrect.width - gap;
        top = rect.top + (rect.height / 2) - (mrect.height / 2);
        break;
      case 'right':
      default:
        left = rect.right + gap;
        top = rect.top + (rect.height / 2) - (mrect.height / 2);
        break;
    }
    return { left, top };
  }

  // Check if a proposed box fits and avoids covering the target significantly
  function scorePlacement(left, top) {
    // Clamp to viewport for scoring (without mutating)
    let cl = left;
    let ct = top;
    if (cl + mrect.width > viewportWidth - padding) cl = viewportWidth - mrect.width - padding;
    if (cl < padding) cl = padding;
    if (ct + mrect.height > viewportHeight - padding) ct = viewportHeight - mrect.height - padding;
    if (ct < padding) ct = padding;

    // Overlap area with target (approx)
    const overLeft = Math.max(cl, rect.left);
    const overTop = Math.max(ct, rect.top);
    const overRight = Math.min(cl + mrect.width, rect.right);
    const overBottom = Math.min(ct + mrect.height, rect.bottom);
    const overlapW = Math.max(0, overRight - overLeft);
    const overlapH = Math.max(0, overBottom - overTop);
    const overlapArea = overlapW * overlapH;

    // Visible area within viewport after clamping
    const visibleW = Math.min(mrect.width, Math.max(0, viewportWidth - padding - cl));
    const visibleH = Math.min(mrect.height, Math.max(0, viewportHeight - padding - ct));
    const visibleArea = visibleW * visibleH;

    // Higher score is better: prefer zero overlap, then larger visible area, then proximity (smaller movement from preferred)
    return { cl, ct, overlapArea, visibleArea };
  }

  // Build candidate sides: prefer requested first, then the rest by available space
  const spaces = {
    top: rect.top - padding,
    bottom: viewportHeight - rect.bottom - padding,
    left: rect.left - padding,
    right: viewportWidth - rect.right - padding
  };
  const allSides = ['right', 'bottom', 'left', 'top'];
  const preferred = step.position && allSides.includes(step.position) ? step.position : 'right';
  const others = allSides.filter(s => s !== preferred).sort((a,b)=>spaces[b]-spaces[a]);
  const order = [preferred, ...others];

  // Evaluate candidates and pick the best (minimize overlap, maximize visible area)
  let best = null;
  for (const side of order) {
    const { left, top } = computeBySide(side);
    const s = scorePlacement(left, top);
    const score = (s.overlapArea === 0 ? 1 : 0) * 1e9 + s.visibleArea - s.overlapArea;
    if (!best || score > best.score) {
      best = { side, score, ...s };
    }
  }

  // Apply the best placement
  modalContent.style.left = `${Math.round(best.cl)}px`;
  modalContent.style.top = `${Math.round(best.ct)}px`;
}

function highlightElement(element) {
    removeHighlight();
    
    // Don't highlight if the element is not visible
    if (!element || !element.getBoundingClientRect || element.offsetParent === null) {
        return;
    }
    
    highlightedElement = element;
    
    // Add highlight class with animation
    element.classList.add('tour-highlight');
    
    // Add a pulsing animation
    const pulse = document.createElement('div');
    pulse.className = 'tour-highlight-pulse';
    document.body.appendChild(pulse);
    
    // Position the pulse effect
    const rect = element.getBoundingClientRect();
    pulse.style.width = `${rect.width + 20}px`;
    pulse.style.height = `${rect.height + 20}px`;
    pulse.style.left = `${rect.left + window.scrollX - 10}px`;
    pulse.style.top = `${rect.top + window.scrollY - 10}px`;
    
    // Remove pulse after animation completes
    setTimeout(() => {
        if (pulse.parentNode) {
            pulse.parentNode.removeChild(pulse);
        }
    }, 1000);
}

function removeHighlight() {
    if (highlightedElement) {
        highlightedElement.classList.remove('tour-highlight');
        
        // Remove any existing pulse effects
        const existingPulses = document.querySelectorAll('.tour-highlight-pulse');
        existingPulses.forEach(pulse => {
            if (pulse.parentNode) {
                pulse.parentNode.removeChild(pulse);
            }
        });
        
        highlightedElement = null;
    }
}

function setupTour() {
    // Add event listeners
    const startButton = document.getElementById('startTour');
    if (startButton) {
        const triggerStart = (e) => { e.preventDefault(); e.stopPropagation(); startTour(); };
        startButton.addEventListener('click', triggerStart);
        startButton.addEventListener('pointerdown', triggerStart);
    }
    
    function nextStep() {
        if (currentStep < tourSteps.length - 1) {
            currentStep++;
            showStep(currentStep);
        } else {
            endTour();
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    }

    // Add navigation event listeners
    const nextButton = document.getElementById('tourNext');
    const prevButton = document.getElementById('tourPrev');
    const skipButton = document.getElementById('tourSkip');
    
    if (nextButton) nextButton.addEventListener('click', nextStep);
    if (prevButton) prevButton.addEventListener('click', prevStep);
    if (skipButton) skipButton.addEventListener('click', endTour);
    
    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('tourModal');
        if (!modal || modal.getAttribute('aria-hidden') === 'true') return;
        
        switch (e.key) {
            case 'ArrowRight':
            case ' ':
                e.preventDefault();
                nextStep();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                prevStep();
                break;
            case 'Escape':
                e.preventDefault();
                endTour();
                break;
        }
    });
    
    // Close tour when clicking outside the modal content
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('tourModal');
        const modalContent = modal?.querySelector('.modal-content');
        
        if (modal && 
            modal.getAttribute('aria-hidden') === 'false' &&
            !modalContent?.contains(e.target) &&
            !e.target.closest('.tour-highlight') &&
            !(startButton && startButton.contains(e.target))) {
            endTour();
        }
    });
    
    // Start tour automatically on first visit
    if (!localStorage.getItem('tourCompleted') && startButton) {
        // Small delay to ensure the page is fully loaded
        setTimeout(startTour, 1500);
    }
}

// Add a simple contains polyfill for querySelector
if (!Element.prototype.matches) {
    Element.prototype.matches = 
        Element.prototype.matchesSelector || 
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector || 
        Element.prototype.oMatchesSelector || 
        Element.prototype.webkitMatchesSelector ||
        function(s) {
            const matches = (this.document || this.ownerDocument).querySelectorAll(s);
            let i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;            
        };
}

// Use real slum data from TIFF predictions (loaded from slum_data.js)
// Fallback to empty data if realSlumData is not available
const mockSlumData = typeof realSlumData !== 'undefined' ? realSlumData : {
    mumbai: []
};

// City Manager instance - will be initialized with dynamic cities from Supabase
let cityManager = null;
let cityCoordinates = {}; // Will be populated by CityManager for backward compatibility

// Dynamically load UTIF.js if it's missing (fallback-friendly)
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.crossOrigin = 'anonymous';
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load ' + src));
        document.head.appendChild(s);
    });
}

async function ensureUTIFLoaded() {
    if (window.UTIF) return;
    const candidates = [
        // Known good root paths
        'https://cdn.jsdelivr.net/npm/utif@3.1.0/UTIF.min.js',
        'https://unpkg.com/utif@3.1.0/UTIF.min.js',
        // Fallbacks
        'https://cdn.jsdelivr.net/npm/utif@latest/UTIF.min.js',
        'https://unpkg.com/utif@latest/UTIF.min.js',
        // Legacy build paths (some mirrors use /build)
        'https://cdn.jsdelivr.net/npm/utif@3.1.0/build/UTIF.min.js',
        'https://unpkg.com/utif@3.1.0/build/UTIF.min.js',
        // Local fallbacks (place UTIF.min.js in your site root or /lib/)
        'UTIF.min.js',
        './UTIF.min.js',
        '/UTIF.min.js',
        'lib/UTIF.min.js',
        '/lib/UTIF.min.js'
    ];
    for (const url of candidates) {
        try {
            await loadScript(url);
            if (window.UTIF) return; // loaded successfully
        } catch (_) {
            // try next
        }
    }
}

// Loading overlay helpers
function showLoading(text = 'Loading…') {
    try {
        const el = document.getElementById('loadingOverlay');
        if (!el) return;
        const t = el.querySelector('.loading-text');
        if (t) t.textContent = text;
        el.classList.remove('hidden');
    } catch (_) {}
}

function hideLoading() {
    try {
        const el = document.getElementById('loadingOverlay');
        if (!el) return;
        el.classList.add('hidden');
    } catch (_) {}
}
// Export: download the current overlay as a TIFF using UTIF.js
async function exportOverlayTiff() {
    try {
        if (!window.UTIF) {
            await ensureUTIFLoaded();
        }
        if (!window.UTIF) {
            alert('TIFF encoder (UTIF.js) failed to load. Check your network and try again.');
            return;
        }
        if (!lastOverlayRGBA || !lastOverlayWidth || !lastOverlayHeight) {
            if (cachedGeoRaster && overlayBounds) {
                // Try to render once to populate buffers
                renderImageOverlayFromRaster(currentThreshold, true);
            }
        }
        if (!lastOverlayRGBA || !lastOverlayWidth || !lastOverlayHeight) {
            alert('Overlay is not ready yet. Please wait a moment and try again.');
            return;
        }
        const rgba = lastOverlayRGBA;
        const rgba8 = (rgba instanceof Uint8ClampedArray) ? new Uint8Array(rgba) : (rgba instanceof Uint8Array ? rgba : new Uint8Array(rgba.buffer));
        const w = lastOverlayWidth;
        const h = lastOverlayHeight;
        let buffer = null;
        // Try both UTIF APIs to be robust across versions
        if (typeof UTIF.encodeImage === 'function' && typeof UTIF.encode === 'function') {
            const ifdOrIfds = UTIF.encodeImage(rgba8, w, h);
            const ifds = Array.isArray(ifdOrIfds) ? ifdOrIfds : [ifdOrIfds];
            buffer = UTIF.encode(ifds);
        } else if (typeof UTIF.fromRGBA8 === 'function' && typeof UTIF.encode === 'function') {
            const ifds = UTIF.fromRGBA8(rgba8, w, h);
            buffer = UTIF.encode(ifds);
        } else {
            alert('UTIF encoder interface not supported by the loaded version.');
            return;
        }
        const blob = new Blob([buffer], { type: 'image/tiff' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        a.href = url;
        a.download = `overlay-threshold-${currentThreshold.toFixed(2)}-${ts}.tiff`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Failed to export overlay TIFF:', err);
        alert('Failed to export TIFF. See console for details.');
    }
}

// (Removed bounds export as requested)

// Compute a local-density smoothed field (0..1) from a binary raster using an integral image.
// radius defines the neighborhood radius in pixels; window size = (2*radius+1)^2.
function computeSmoothedBandFromBinary(georaster, radius = 3) {
    const width = georaster.width || georaster.cols || (georaster.values && georaster.values[0] && georaster.values[0][0] ? georaster.values[0][0].length : 0);
    const height = georaster.height || georaster.rows || (georaster.values && georaster.values[0] ? georaster.values[0].length : 0);
    const band0 = georaster.values ? georaster.values[0] : null;
    const noData = georaster.noDataValue;
    if (!width || !height || !band0) return null;

    const W = width + 1;
    const integral = new Float64Array(W * (height + 1));

    // Build integral image over binary mask (non-zero => 1, else 0)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const v = band0[y][x];
            const m = (typeof v === 'number' && !isNaN(v) && (noData === undefined || v !== noData) && v !== 0) ? 1 : 0;
            const idx = (y + 1) * W + (x + 1);
            integral[idx] = m + integral[idx - 1] + integral[idx - W] - integral[idx - W - 1];
        }
    }

    // Compute local mean via integral sums
    const out = new Array(height);
    for (let y = 0; y < height; y++) {
        const outRow = new Float32Array(width);
        const y0 = Math.max(0, y - radius);
        const y1 = Math.min(height - 1, y + radius);
        for (let x = 0; x < width; x++) {
            const x0 = Math.max(0, x - radius);
            const x1 = Math.min(width - 1, x + radius);
            const A = integral[y0 * W + x0];
            const B = integral[y0 * W + (x1 + 1)];
            const C = integral[(y1 + 1) * W + x0];
            const D = integral[(y1 + 1) * W + (x1 + 1)];
            const sum = D - B - C + A;
            const area = (x1 - x0 + 1) * (y1 - y0 + 1);
            outRow[x] = area > 0 ? (sum / area) : 0;
        }
        out[y] = outRow;
    }
    return out;
}

// Slider mode: 'threshold' uses values to threshold raster; 'opacity' uses slider to control overlay opacity
let sliderMode = 'threshold';

// Switch the slider between thresholding and opacity modes and update UI labels.
function setSliderMode(mode) {
    sliderMode = mode === 'opacity' ? 'opacity' : 'threshold';
    const section = document.getElementById('thresholdSection');
    if (!section) return;
    const header = section.querySelector('h4');
    const labelEl = section.querySelector('.threshold-input label');
    const metricsEl = document.querySelector('.model-metrics');
    const overlayOpacityEl = document.getElementById('overlayOpacity');
    if (sliderMode === 'opacity') {
        if (header) header.textContent = 'Overlay Opacity';
        if (labelEl) labelEl.textContent = 'Opacity';
        if (metricsEl) metricsEl.style.display = 'none';
        // Show a note that slider controls opacity now
        try { setThresholdControlsEnabled(true, 'Binary mask detected — slider controls opacity'); } catch (_) {}
        if (overlayOpacityEl && overlayOpacityEl.parentElement) overlayOpacityEl.parentElement.style.display = 'none';
    } else {
        if (header) header.textContent = 'Model Threshold';
        if (labelEl) labelEl.textContent = 'Threshold:';
        if (metricsEl) metricsEl.style.display = '';
        try { setThresholdControlsEnabled(true, ''); } catch (_) {}
        if (overlayOpacityEl && overlayOpacityEl.parentElement) overlayOpacityEl.parentElement.style.display = '';
    }
}

// Enable/disable threshold UI and optionally show a note. Also hides metrics for binary rasters.
function setThresholdControlsEnabled(enabled, noteText) {
    const rangeEl = document.getElementById('thresholdRange');
    const inputEl = document.getElementById('thresholdInput');
    const valueEl = document.getElementById('thresholdValue');
    const metricsEl = document.querySelector('.model-metrics');
    const controlsContainer = document.querySelector('.threshold-controls');
    if (rangeEl) rangeEl.disabled = !enabled;
    if (inputEl) inputEl.disabled = !enabled;
    if (metricsEl) metricsEl.style.display = enabled ? '' : 'none';
    if (controlsContainer) {
        let note = document.getElementById('thresholdDisabledNote');
        if (!enabled) {
            if (!note) {
                note = document.createElement('div');
                note.id = 'thresholdDisabledNote';
                note.style.color = '#94a3b8';
                note.style.fontSize = '0.8rem';
                note.style.marginTop = '0.25rem';
                controlsContainer.appendChild(note);
            }
            note.textContent = noteText || 'Threshold disabled.';
            if (valueEl) valueEl.textContent = '—';
        } else {
            if (note) note.remove();
            if (valueEl) valueEl.textContent = parseFloat(currentThreshold).toFixed(2);
        }
    }
}

// Create or remove a dimming polygon outside overlay bounds
function updateFocusMask() {
    const toggle = document.getElementById('focusMaskToggle');
    const on = toggle ? !!toggle.checked : true;
    // Remove existing mask
    if (focusMaskLayer) {
        try { map.removeLayer(focusMaskLayer); } catch (_) {}
        focusMaskLayer = null;
    }
    if (!on) return;
    const ol = getActiveOverlay();
    if (!ol || !ol.getBounds) return;
    let b;
    try { b = ol.getBounds(); } catch (_) { b = null; }
    if (!b || !b.isValid()) return;
    const sw = b.getSouthWest();
    const ne = b.getNorthEast();
    const hole = [
        [sw.lat, sw.lng],
        [sw.lat, ne.lng],
        [ne.lat, ne.lng],
        [ne.lat, sw.lng]
    ];
    const world = [
        [-90, -180],
        [-90, 180],
        [90, 180],
        [90, -180]
    ];
    // Polygon with a hole: world as outer ring, overlay bounds as hole
    focusMaskLayer = L.polygon([world, hole], {
        pane: 'focusDimPane',
        color: '#000',
        weight: 0,
        fill: true,
        fillColor: '#000',
        fillOpacity: 0.55,
        interactive: false
    });
    focusMaskLayer.addTo(map);
}


// Attempt to load a pre-generated GeoJSON polygon overlay for a crisp and stable look
async function addPolygonOverlay() {
    try {
        const res = await fetch('slum_overlay.geojson', { cache: 'no-store' });
        if (!res.ok) throw new Error('GeoJSON not found');
        const gj = await res.json();
        // Build vector layer
        polygonOverlay = L.geoJSON(gj, {
            pane: 'slumVectorPane',
            style: function() {
                return {
                    color: '#00d4ff',
                    opacity: 0.95,
                    weight: 2.0,
                    fill: true,
                    fillColor: '#ffffff',
                    fillOpacity: 0.98
                };
            }
        });
        polygonOverlay.addTo(map);
        try {
            const b = polygonOverlay.getBounds();
            if (b && b.isValid()) {
                map.fitBounds(b, { padding: [20, 20], maxZoom: 13 });
            }
        } catch (_) {}
        console.log('Vector overlay added');
        return true;
    } catch (e) {
        console.warn('Vector overlay unavailable, falling back to raster:', e.message || e);
        return false;
    }
}

// Try a static PNG overlay first (stablest), then vector, then raster
let imageOverlayLayer = null; // static image overlay

async function addImageOverlayIfAvailable() {
    try {
        const metaRes = await fetch('slum_overlay_bounds.json', { cache: 'no-store' });
        if (!metaRes.ok) throw new Error('bounds json missing');
        const { west, south, east, north } = await metaRes.json();
        const bounds = [[south, west], [north, east]];
        imageOverlayLayer = L.imageOverlay('slum_overlay.png', bounds, {
            pane: 'slumRasterPane',
            opacity: 1.0,
            interactive: false,
            className: 'slum-overlay-img'
        });
        imageOverlayLayer.addTo(map);
        try { map.fitBounds(bounds, { padding: [20, 20], maxZoom: 13 }); } catch (_) {}
        console.log('Image overlay added');
        return true;
    } catch (e) {
        console.warn('Image overlay unavailable:', e.message || e);
        return false;
    }
}

// Initialize overlay: prefer image, then vector, then geotiff
async function initOverlay() {
    // Always use the TIFF-based overlay so the threshold control is effective.
    await addRasterOverlay();
    // Sync UI controls to overlay state
    try {
        const toggle = document.getElementById('overlayToggle');
        const slider = document.getElementById('overlayOpacity');
        if (toggle) toggle.checked = isOverlayOnMap();
        if (slider) {
            // best effort to read opacity; default 85
            let op = 0.85;
            if (imageOverlayLayer) op = imageOverlayLayer.options.opacity ?? 0.85;
            else if (rasterLayer) op = rasterLayer.options.opacity ?? 0.85;
            else if (polygonOverlay) {
                const first = polygonOverlay.getLayers && polygonOverlay.getLayers()[0];
                if (first && first.options && typeof first.options.fillOpacity === 'number') {
                    op = first.options.fillOpacity;
                } else op = 0.6;
            }
            slider.value = Math.round(op * 100);
            const ovEl = document.getElementById('overlayOpacityValue');
            if (ovEl) ovEl.textContent = `${slider.value}%`;
        }
    } catch (_) {}
    // Update focus mask once overlay is ready
    try { updateFocusMask(); } catch (_) {}
}

// Helpers to control whichever overlay is present
function getActiveOverlay() {
    return imageOverlayLayer || polygonOverlay || rasterLayer || null;
}

function isOverlayOnMap() {
    const ol = getActiveOverlay();
    return !!(ol && ol._map);
}

function setOverlayVisibility(visible) {
    const ol = getActiveOverlay();
    if (!ol) return;
    if (visible) {
        ol.addTo(map);
        if (typeof ol.bringToBack === 'function') ol.bringToBack();
    } else {
        map.removeLayer(ol);
    }
    // Recompute focus mask on visibility change
    updateFocusMask();
}

function setOverlayOpacity(opacity) {
    // opacity is 0..1
    if (polygonOverlay) {
        try { polygonOverlay.setStyle({ fillOpacity: opacity, opacity: Math.max(0.2, Math.min(1, opacity)) }); } catch (_) {}
    }
    if (rasterLayer) {
        try { rasterLayer.setOpacity(opacity); } catch (_) {}
    }
    if (imageOverlayLayer) {
        try { imageOverlayLayer.setOpacity(opacity); } catch (_) {}
    }
}

// Mock LGBM model performance data
const modelPerformanceData = [
    { threshold: 0.1, precision: 0.45, recall: 0.95, f1: 0.61 },
    { threshold: 0.2, precision: 0.52, recall: 0.89, f1: 0.66 },
    { threshold: 0.3, precision: 0.61, recall: 0.84, f1: 0.71 },
    { threshold: 0.4, precision: 0.72, recall: 0.78, f1: 0.75 },
    { threshold: 0.5, precision: 0.85, recall: 0.72, f1: 0.78 },
    { threshold: 0.6, precision: 0.89, recall: 0.65, f1: 0.75 },
    { threshold: 0.7, precision: 0.92, recall: 0.58, f1: 0.71 },
    { threshold: 0.8, precision: 0.95, recall: 0.48, f1: 0.64 },
    { threshold: 0.9, precision: 0.97, recall: 0.35, f1: 0.51 }
];

// Initialize the map
let map;
let markers = [];
let currentCity = null; // Will be set by CityManager
let currentThreshold = 0.35;
let rasterLayer = null; // GeoTIFF overlay layer (fallback)
let polygonOverlay = null; // Vector overlay (preferred)
const RASTER_TIFF_URL = encodeURI('pred_LightGBM (1).tif');
let cachedGeoRaster = null; // reuse after first parse
let baseTiles = null; // dark basemap (optional)
let lightTiles = null; // Carto Positron (labels)
let labelTiles = null; // optional labels overlay
let osmTiles = null;   // OSM Standard tiles
let markersVisible = false; // Show markers by default
let focusMaskLayer = null; // dims outside overlay bounds
let overlayBounds = null; // geographic bounds of the raster overlay
let lastRenderedThreshold = null; // used to avoid redundant re-renders
let lastOverlayRGBA = null; // Uint8ClampedArray of last rendered overlay RGBA
let lastOverlayWidth = 0;
let lastOverlayHeight = 0;
let rasterValueMin = null; // min of raster values (excluding nodata)
let rasterValueMax = null; // max of raster values (excluding nodata)
let isBinaryRaster = false; // true if raster has only 0 and one non-zero value
let binaryNonZeroValue = null; // the non-zero value used when isBinaryRaster
let smoothedBand = null; // 2D array of Float32Array rows (0..1) for binary smoothing
let smoothingWindowRadius = 3; // radius in pixels for local-density smoothing

// POI layers (loaded on demand via sidebar toggles)
let poiLayers = {
    toilets: null,
    landfillsPolygons: null,
    schoolsPoints: null
};

const BINARY_TIF_CONFIG = {
    publicToilets: {
        url: encodeURI('public_toilets.tif'),
        className: 'tif-point--toilet',
        label: 'Optimal Public Toilets'
    },
    welfareCanteens: {
        url: encodeURI('welfare_canteens_and_shops.tif'),
        className: 'tif-point--welfare',
        label: 'Optimal Welfare Canteens & Shops'
    }
};

let binaryTifLayers = {
    publicToilets: null,
    welfareCanteens: null
};

let cachedBinaryGeoRasters = {
    publicToilets: null,
    welfareCanteens: null
};

// Configuration for POI layers under static_data/geojson
const POI_CONFIG = {
    toilets: {
        url: 'static_data/geojson/amenity_toilets_points.geojson',
        geom: 'point',
        label: 'Public Toilet',
        type: 'toilets'
    },
    landfillsPolygons: {
        url: 'static_data/geojson/landuse_landfill_multipolygons.geojson',
        geom: 'polygon',
        label: 'Landfill (Area)',
        type: 'landfill'
    },
    schoolsPoints: {
        url: 'static_data/geojson/amenity_school_points.geojson',
        geom: 'point',
        label: 'School (Point)',
        type: 'school'
    }
};

function getPoiColors(kind) {
    switch (kind) {
        case 'toilets':
            return { fill: '#60a5fa', stroke: '#1d4ed8' }; // blue
        case 'landfillsPolygons':
        case 'landfill':
            return { fill: '#a16207', stroke: '#713f12' }; // amber/brown
        case 'schoolsPoints':
        case 'school':
            return { fill: '#22c55e', stroke: '#166534' }; // green
        default:
            return { fill: '#f59e0b', stroke: '#78350f' }; // fallback amber
    }
}

function buildGeoJsonLayer(geojson, cfg) {
    const colors = getPoiColors(cfg.type);
    return L.geoJSON(geojson, {
        pane: 'poiPane',
        pointToLayer: (feature, latlng) => {
            if (cfg.geom !== 'point') return null;
            return L.circleMarker(latlng, {
                radius: 6,
                color: colors.stroke,
                weight: 1.5,
                fillColor: colors.fill,
                fillOpacity: 0.9
            });
        },
        style: (feature) => {
            if (cfg.geom !== 'polygon') return undefined;
            return {
                color: colors.stroke,
                weight: cfg.type === 'landfillsPolygons' ? 1.4 : 1.1,
                fillColor: colors.fill,
                fillOpacity: cfg.type === 'landfillsPolygons' ? 0.35 : 0.25
            };
        },
        onEachFeature: (feature, layer) => {
            try {
                const p = feature && feature.properties ? feature.properties : {};
                const name = p.name || p.amenity || p.landuse || cfg.label;
                const html = `<div style="font-family:Inter,system-ui,sans-serif;font-size:12px;color:#0f172a;">` +
                    `<strong style="color:#111827;">${cfg.label}</strong>` + (name && name !== cfg.label ? `: ${name}` : '') +
                    `</div>`;
                layer.bindPopup(html);
            } catch (_) {}
        }
    });
}

// Map POI keys to index names
const POI_KEY_TO_INDEX = {
    'toilets': 'toilets',
    'landfillsPolygons': 'landfills',
    'schoolsPoints': 'schools'
};

async function tryLoadPOIFromIndex(key, cfg) {
    try {
        const indexKey = POI_KEY_TO_INDEX[key];
        if (!indexKey) {
            console.log(`No index mapping for POI key: ${key}`);
            return false;
        }

        if (!window.poiIndexManager.isAvailable(indexKey)) {
            console.log(`Index not available for: ${indexKey}`);
            return false;
        }

        console.log(`Loading ${key} using spatial index`);

        // Get current map bounds
        const bounds = window.poiIndexManager.getMapBounds(map);

        // Query features in viewport
        const features = await window.poiIndexManager.queryPOIsInBounds(indexKey, bounds);

        if (features.length === 0) {
            console.log(`No ${key} features found in current viewport`);
            // Still create empty layer to mark as loaded
            poiLayers[key] = L.layerGroup();
            poiLayers[key].addTo(map);
            return true;
        }

        // Create GeoJSON from indexed features
        const geojson = window.poiIndexManager.createGeoJSONFromFeatures(features);

        // Build and add layer
        const layer = buildGeoJsonLayer(geojson, cfg);
        poiLayers[key] = layer;
        layer.addTo(map);
        try { layer.bringToFront(); } catch (_) {}

        console.log(`Loaded ${features.length} ${key} features from index`);
        return true;

    } catch (error) {
        console.warn(`Failed to load ${key} from index:`, error);
        return false;
    }
}

async function loadPOILayer(key) {
    const cfg = POI_CONFIG[key];
    if (!cfg) return;
    if (poiLayers[key]) {
        // already built
        poiLayers[key].addTo(map);
        try { poiLayers[key].bringToFront(); } catch (_) {}
        return;
    }

    try {
        // Try to use indexed approach first
        if (window.poiIndexManager && await tryLoadPOIFromIndex(key, cfg)) {
            return;
        }

        // Fallback to original approach
        console.log(`Loading ${key} using fallback method`);
        const res = await fetch(cfg.url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load ${cfg.url}: ${res.status}`);
        const gj = await res.json();
        const layer = buildGeoJsonLayer(gj, cfg);
        poiLayers[key] = layer;
        layer.addTo(map);
        try { layer.bringToFront(); } catch (_) {}
    } catch (e) {
        console.warn('POI layer load failed:', key, e);
    }
}

async function togglePOILayer(key, on) {
    const layer = poiLayers[key];
    if (on) {
        await loadPOILayer(key);
    } else if (layer) {
        try { map.removeLayer(layer); } catch (_) {}
    }

    // Update legend visibility
    updatePOILegendVisibility();
}

function normalizeProjection(proj) {
    if (!proj) return null;
    if (typeof proj === 'number' && isFinite(proj)) return `EPSG:${proj}`;
    if (typeof proj === 'string') {
        const p = proj.trim();
        if (/^\d+$/.test(p)) return `EPSG:${p}`;
        return p;
    }
    return null;
}

function ensureProj4Def(proj) {
    if (typeof proj4 === 'undefined' || !proj4) return;
    if (proj === 'EPSG:32643' && !proj4.defs['EPSG:32643']) {
        proj4.defs('EPSG:32643', '+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs +type=crs');
    }
}

function pixelCenterToLatLngFromBounds(bounds, width, height, x, y) {
    // Assumes raster row 0 is the top (north) of the image.
    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const west = bounds.getWest();
    const east = bounds.getEast();
    const latSpan = north - south;
    const lngSpan = east - west;
    const lng = west + ((x + 0.5) / width) * lngSpan;
    const lat = north - ((y + 0.5) / height) * latSpan;
    return L.latLng(lat, lng);
}

function getGeoRasterLatLngBounds(georaster) {
    if (!map || typeof GeoRasterLayer === 'undefined' || !GeoRasterLayer) return null;
    try {
        try { ensureProj4Def(normalizeProjection(georaster && georaster.projection)); } catch (_) {}
        let tmpLayer = new GeoRasterLayer({
            georaster,
            pane: 'slumRasterPane',
            opacity: 0.0,
            resolution: 256
        });
        tmpLayer.addTo(map);
        let bounds = null;
        try { bounds = tmpLayer.getBounds(); } catch (_) { bounds = null; }
        try { map.removeLayer(tmpLayer); } catch (_) {}
        tmpLayer = null;
        if (bounds && bounds.isValid && bounds.isValid()) return bounds;
        return null;
    } catch (_) {
        return null;
    }
}

function isLikelyLatLngExtent(xmin, ymin, xmax, ymax) {
    if (![xmin, ymin, xmax, ymax].every(v => typeof v === 'number' && isFinite(v))) return false;
    if (xmin < -180 || xmax > 180) return false;
    if (ymin < -90 || ymax > 90) return false;
    return true;
}

function pixelCenterToLatLng(georaster, x, y) {
    const pxW = georaster.pixelWidth;
    const pxH = georaster.pixelHeight;
    const xCoord = georaster.xmin + (x + 0.5) * pxW;
    const yCoord = georaster.ymax + (y + 0.5) * pxH;
    const proj = normalizeProjection(georaster.projection);
    if (!proj || proj === 'EPSG:4326') {
        return L.latLng(yCoord, xCoord);
    }
    if (typeof proj4 === 'undefined' || !proj4) {
        return L.latLng(yCoord, xCoord);
    }
    ensureProj4Def(proj);
    try {
        const out = proj4(proj, 'EPSG:4326', [xCoord, yCoord]);
        return L.latLng(out[1], out[0]);
    } catch (_) {
        return L.latLng(yCoord, xCoord);
    }
}

function makeBinaryTifDivIcon(cfg) {
    return L.divIcon({
        className: 'tif-point-marker',
        html: `<div class="tif-point ${cfg.className}"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -14]
    });
}

async function buildBinaryTifLayer(key) {
    const cfg = BINARY_TIF_CONFIG[key];
    if (!cfg) return null;
    if (binaryTifLayers[key]) return binaryTifLayers[key];

    const response = await fetch(cfg.url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to fetch TIFF: ${response.status} ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const georaster = await parseGeoraster(arrayBuffer);
    cachedBinaryGeoRasters[key] = georaster;

    const band = georaster.values ? georaster.values[0] : null;
    const width = georaster.width || georaster.cols || (band && band[0] ? band[0].length : 0);
    const height = georaster.height || georaster.rows || (band ? band.length : 0);
    if (!band || !width || !height) throw new Error('Invalid raster values');

    let bounds = getGeoRasterLatLngBounds(georaster);
    if (!bounds) {
        if (isLikelyLatLngExtent(georaster.xmin, georaster.ymin, georaster.xmax, georaster.ymax)) {
            bounds = L.latLngBounds([georaster.ymin, georaster.xmin], [georaster.ymax, georaster.xmax]);
        }
    }
    if (!bounds || !bounds.isValid || !bounds.isValid()) {
        console.warn('Binary TIFF bounds could not be computed; aborting to prevent wrong placement', {
            key,
            projection: georaster && georaster.projection,
            xmin: georaster && georaster.xmin,
            xmax: georaster && georaster.xmax,
            ymin: georaster && georaster.ymin,
            ymax: georaster && georaster.ymax
        });
        throw new Error('Cannot compute map bounds for this TIFF (projection/metadata mismatch).');
    }

    const totalCells = width * height;
    const maxCellsToScan = 2500000;
    const stride = totalCells > maxCellsToScan ? Math.ceil(Math.sqrt(totalCells / maxCellsToScan)) : 1;
    const noData = georaster.noDataValue;
    const icon = makeBinaryTifDivIcon(cfg);

    const group = L.layerGroup();
    let added = 0;
    for (let y = 0; y < height; y += stride) {
        const row = band[y];
        if (!row) continue;
        for (let x = 0; x < width; x += stride) {
            const v = row[x];
            if (typeof v !== 'number' || isNaN(v) || (noData !== undefined && v === noData)) continue;
            if (Math.round(v) !== 1) continue;
            const ll = pixelCenterToLatLngFromBounds(bounds, width, height, x, y);
            const m = L.marker(ll, { icon, pane: 'tifPointPane', interactive: false });
            group.addLayer(m);
            added++;
        }
    }

    const maxMarkers = 12000;
    if (added > maxMarkers) {
        const layers = group.getLayers();
        const keepEvery = Math.ceil(layers.length / maxMarkers);
        group.clearLayers();
        for (let i = 0; i < layers.length; i += keepEvery) {
            group.addLayer(layers[i]);
        }
    }

    binaryTifLayers[key] = group;
    return group;
}

async function toggleBinaryTifLayer(key, on) {
    if (!map) return;
    if (on) {
        try {
            const layer = await buildBinaryTifLayer(key);
            if (!layer) return;
            layer.addTo(map);
        } catch (e) {
            console.warn('Binary TIFF layer load failed:', key, e);
        }
    } else {
        const layer = binaryTifLayers[key];
        if (layer) {
            try { map.removeLayer(layer); } catch (_) {}
        }
    }
}

function initializeBinaryTifLayersFromUI() {
    const mapping = [
        ['publicToilets', 'toggleToilets'],
        ['welfareCanteens', 'toggleSchoolsPoints']
    ];
    for (const [key, id] of mapping) {
        const el = document.getElementById(id);
        if (!el) continue;
        toggleBinaryTifLayer(key, !!el.checked);
    }
}

// Update POI legend visibility based on active layers
function updatePOILegendVisibility() {
    const legend = document.querySelector('.poi-legend');
    if (!legend) return;

    // Check if any POI layers are active
    const hasActivePOI = Object.values(poiLayers).some(layer =>
        layer && map && map.hasLayer(layer)
    );

    // Show/hide legend based on active POI layers
    legend.style.display = hasActivePOI ? 'block' : 'none';
}

// Refresh POI layers when viewport changes (for indexed loading)
function refreshActivePOILayers() {
    if (!window.poiIndexManager) return;

    // Check which POI layers are currently active
    const activeLayers = [];
    for (const [key, layer] of Object.entries(poiLayers)) {
        if (layer && map.hasLayer(layer)) {
            activeLayers.push(key);
        }
    }

    // Reload active layers with new viewport data
    for (const key of activeLayers) {
        // Remove current layer
        const layer = poiLayers[key];
        if (layer) {
            try { map.removeLayer(layer); } catch (_) {}
            poiLayers[key] = null; // Force reload
        }

        // Reload with new viewport
        loadPOILayer(key);
    }
}

function initializePOILayersFromUI() {
    const mapping = [
        ['landfillsPolygons', 'toggleLandfillsPolygons'],
    ];
    for (const [key, id] of mapping) {
        const el = document.getElementById(id);
        if (!el) continue;
        togglePOILayer(key, !!el.checked);
    }
}

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', async function () {
    // Ensure loading overlay is visible until the overlay is ready
    showLoading('Loading cities and map…');

    // Initialize City Manager first
    await initializeCityManager();

    initializeMap();

    // Initialize POI Index Manager
    if (window.poiIndexManager) {
        await window.poiIndexManager.initialize();
    }

    // Prefer stable vector overlay if available; fallback to TIFF
    initOverlay();
    setupEventListeners();
    // Initialize POI layers to match current checkbox states
    initializePOILayersFromUI();
    initializeBinaryTifLayersFromUI();

    // Initialize legend visibility (hide by default)
    setTimeout(() => {
        updatePOILegendVisibility();
    }, 100);

    // Ensure UI reflects the default threshold and stats (also applies marker visibility)
    updateThreshold(currentThreshold);
    // Apply initial background dim from UI default
    const bgSlider = document.getElementById('bgDimRange');
    if (bgSlider) {
        const val = parseInt(bgSlider.value, 10) || 0;
        applyBackgroundDimming(val);
        const bgValEl = document.getElementById('bgDimValue');
        if (bgValEl) bgValEl.textContent = `${val}%`;
    }
    // Initialize overlay opacity label from current slider value
    const opSlider = document.getElementById('overlayOpacity');
    if (opSlider) {
        const ov = document.getElementById('overlayOpacity').value;
        const ovEl = document.getElementById('overlayOpacityValue');
        if (ovEl) ovEl.textContent = `${ov}%`;
    }
    // Initialize the guided tour
    setupTour();
});

async function initializeCityManager() {
    try {
        // Initialize CityManager with Supabase client
        if (typeof supabaseClient !== 'undefined') {
            cityManager = new CityManager(supabaseClient);
            const result = await cityManager.initialize();

            if (result.success) {
                console.log('CityManager initialized successfully');
                // Populate city selector
                populateCitySelector();
                // Set backward compatibility object
                cityCoordinates = cityManager.getCityCoordinatesObject();
                // Set current city
                currentCity = cityManager.getCurrentCity()?.key;
            } else {
                console.warn('CityManager initialization failed, using fallback:', result.error);
                // Still populate UI with fallback data
                populateCitySelector();
                cityCoordinates = cityManager.getCityCoordinatesObject();
                currentCity = cityManager.getCurrentCity()?.key;
            }
        } else {
            console.warn('Supabase client not available, using fallback cities');
            // Create fallback city manager
            cityManager = new CityManager(null);
            cityManager.loadFallbackCities();
            cityManager.setDefaultCity();
            populateCitySelector();
            cityCoordinates = cityManager.getCityCoordinatesObject();
            currentCity = cityManager.getCurrentCity()?.key;
        }
    } catch (error) {
        console.error('Error initializing CityManager:', error);
        // Create minimal fallback
        cityManager = new CityManager(null);
        cityManager.loadFallbackCities();
        cityManager.setDefaultCity();
        populateCitySelector();
        cityCoordinates = cityManager.getCityCoordinatesObject();
        currentCity = cityManager.getCurrentCity()?.key;
    }
}

function populateCitySelector() {
    // City selector is now hardcoded in HTML, but we still sync with CityManager
    const citySelector = document.getElementById('citySelector');
    if (!citySelector || !cityManager) return;

    // Ensure the current city from CityManager is selected in the dropdown
    const currentCity = cityManager.getCurrentCity();
    if (currentCity && citySelector.value !== currentCity.key) {
        citySelector.value = currentCity.key;
    }

    console.log(`City selector synced with CityManager - current city: ${currentCity?.displayName}`);
}

function initializeMap() {
    // Initialize map centered on default city from CityManager
    const cityCoords = cityManager ? cityManager.getCityCoordinates() : { lat: 19.0760, lng: 72.8777, zoom: 11 };
    map = L.map('map').setView([cityCoords.lat, cityCoords.lng], cityCoords.zoom);

    // Create panes for base and label layers so we can dim them independently
    map.createPane('baseMapPane');
    map.getPane('baseMapPane').style.zIndex = 200; // below overlays
    map.createPane('labelPane');
    map.getPane('labelPane').style.zIndex = 600; // above overlay panes so labels stay readable
    map.getPane('labelPane').style.pointerEvents = 'none';
    // Pane for focus dim mask (between labels and overlays)
    map.createPane('focusDimPane');
    map.getPane('focusDimPane').style.zIndex = 400;
    map.getPane('focusDimPane').style.pointerEvents = 'none';

    // Prepare a dark, no-label basemap (optional)
    baseTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: ' OpenStreetMap contributors, CARTO',
        subdomains: 'abcd',
        maxZoom: 20,
        pane: 'baseMapPane'
    });

    // Add a light, labeled basemap (Carto Positron)
    lightTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: ' OpenStreetMap contributors, CARTO',
        subdomains: 'abcd',
        maxZoom: 20,
        pane: 'baseMapPane'
    });

    // OSM Standard as the default base (with oceans and labels)
    osmTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ' OpenStreetMap contributors',
        maxZoom: 19,
        pane: 'baseMapPane'
    }).addTo(map);

    // Optional labels overlay (off by default)
    labelTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        attribution: ' OpenStreetMap contributors, CARTO',
        subdomains: 'abcd',
        maxZoom: 20,
        opacity: 0.45,
        pane: 'labelPane'
    });

    // Basemap + overlays switcher (labels optional)
    L.control.layers({
        'Carto Light (Labels)': lightTiles,
        'OSM Standard': osmTiles,
        'Dark (No Labels)': baseTiles
    }, {
        'City Labels (toggle)': labelTiles
    }, { position: 'topright', collapsed: true }).addTo(map);

    // Create a pane for the raster overlay so it's above basemap but below markers
    map.createPane('slumRasterPane');
    map.getPane('slumRasterPane').style.zIndex = 450; // tile pane ~200, overlay ~400, marker ~600
    map.getPane('slumRasterPane').style.pointerEvents = 'none'; // keep map interactions unobstructed
    // Create a pane for vector overlay (same stacking as raster)
    map.createPane('slumVectorPane');
    map.getPane('slumVectorPane').style.zIndex = 450;
    map.getPane('slumVectorPane').style.pointerEvents = 'none';
    // Create a pane for POIs (above overlays, below labels)
    map.createPane('poiPane');
    map.getPane('poiPane').style.zIndex = 550;

    map.createPane('tifPointPane');
    map.getPane('tifPointPane').style.zIndex = 750;

    // Add custom controls
    map.zoomControl.setPosition('bottomleft');
}

// Load and display the GeoTIFF as a raster overlay
async function addRasterOverlay() {
    try {
        // Ensure UTM Zone 43N projection is registered for reprojection
        if (typeof proj4 !== 'undefined' && proj4 && !proj4.defs['EPSG:32643']) {
            proj4.defs('EPSG:32643', '+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs +type=crs');
        }

        const response = await fetch(RASTER_TIFF_URL);
        if (!response.ok) throw new Error(`Failed to fetch TIFF: ${response.status} ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        const georaster = await parseGeoraster(arrayBuffer);
        console.log('GeoRaster loaded:', {
            projection: georaster.projection,
            noDataValue: georaster.noDataValue,
            xmin: georaster.xmin,
            xmax: georaster.xmax,
            ymin: georaster.ymin,
            ymax: georaster.ymax,
            pixelWidth: georaster.pixelWidth,
            pixelHeight: georaster.pixelHeight
        });
        cachedGeoRaster = georaster;

        // Compute raster min/max to align threshold with TIFF value scale
        try {
            const band = georaster.values ? georaster.values[0] : null;
            const noData = georaster.noDataValue;
            let minV = Infinity, maxV = -Infinity;
            const nonZeroVals = new Set();
            if (band && band.length) {
                for (let y = 0; y < band.length; y++) {
                    const row = band[y];
                    for (let x = 0; x < row.length; x++) {
                        const v = row[x];
                        if (typeof v !== 'number' || isNaN(v) || (noData !== undefined && v === noData)) continue;
                        if (v < minV) minV = v;
                        if (v > maxV) maxV = v;
                        if (v !== 0) {
                            if (nonZeroVals.size <= 3) nonZeroVals.add(v);
                        }
                    }
                }
            }
            if (minV === Infinity || maxV === -Infinity) {
                rasterValueMin = 0; rasterValueMax = 1;
            } else {
                rasterValueMin = minV; rasterValueMax = maxV;
            }
            // Detect binary mask: only values are 0 and a single non-zero value
            if (nonZeroVals.size === 1) {
                isBinaryRaster = true;
                for (const val of nonZeroVals) { binaryNonZeroValue = val; break; }
            } else {
                isBinaryRaster = false;
                binaryNonZeroValue = null;
            }
            console.log('Raster value range detected:', { rasterValueMin, rasterValueMax });
            if (isBinaryRaster) console.log('Binary mask detected with non-zero value:', binaryNonZeroValue);
        } catch (err) {
            console.warn('Failed computing raster min/max; defaulting to 0..1', err);
            rasterValueMin = 0; rasterValueMax = 1;
            isBinaryRaster = false;
            binaryNonZeroValue = null;
        }

        // If raster is binary, precompute a smoothed 0..1 field to enable meaningful thresholding
        if (isBinaryRaster) {
            try {
                smoothedBand = computeSmoothedBandFromBinary(georaster, smoothingWindowRadius);
                // Override value range for smoothed field
                rasterValueMin = 0; rasterValueMax = 1;
                console.log('Computed smoothed field for binary raster with radius', smoothingWindowRadius);
            } catch (err) {
                console.warn('Failed to compute smoothed field, using raw binary mask:', err);
                smoothedBand = null;
            }
        } else {
            smoothedBand = null;
        }

        // 1) Create a temporary GeoRasterLayer to compute accurate WGS84 bounds
        let tmpLayer = new GeoRasterLayer({ georaster, pane: 'slumRasterPane', opacity: 0.0, resolution: 512 });
        tmpLayer.addTo(map);
        let bounds = null;
        try {
            bounds = tmpLayer.getBounds();
        } catch (_) {}
        try { map.removeLayer(tmpLayer); } catch (_) {}
        tmpLayer = null;

        // 2) Determine bounds (fallback to raster extents if needed)
        if (!bounds || !bounds.isValid()) {
            const south = georaster.ymin;
            const north = georaster.ymax;
            const west = georaster.xmin;
            const east = georaster.xmax;
            bounds = L.latLngBounds([south, west], [north, east]);
        }

        // Store for re-use and render initial overlay using currentThreshold
        overlayBounds = bounds;
        renderImageOverlayFromRaster(currentThreshold, true);
        if (overlayBounds && overlayBounds.isValid()) {
            map.fitBounds(overlayBounds, { padding: [20, 20], maxZoom: 13 });
        }
        console.log('Static image overlay created from GeoTIFF with threshold', { threshold: currentThreshold, bounds: overlayBounds ? overlayBounds.toBBoxString() : null });

        // Always use threshold mode per user preference
        try { setSliderMode('threshold'); } catch (_) {}
        try { setThresholdControlsEnabled(true, ''); } catch (_) {}
    } catch (err) {
        console.error('Error adding raster overlay:', err);
    }
}

// Renders the cached GeoTIFF into a stable ImageOverlay using the given threshold.
// White pixels where value >= threshold, transparent otherwise. Keeps overlay stable on zoom.
function renderImageOverlayFromRaster(thresholdNormalized, replaceExisting = true) {
    if (!cachedGeoRaster || !overlayBounds) return;

    // Avoid redundant work on tiny changes
    if (lastRenderedThreshold !== null && Math.abs(thresholdNormalized - lastRenderedThreshold) < 0.001) {
        return;
    }

    const georaster = cachedGeoRaster;
    const width = georaster.width || georaster.cols || (georaster.values && georaster.values[0] && georaster.values[0][0] ? georaster.values[0][0].length : 0);
    const height = georaster.height || georaster.rows || (georaster.values && georaster.values[0] ? georaster.values[0].length : 0);
    const band = (isBinaryRaster && smoothedBand) ? smoothedBand : (georaster.values ? georaster.values[0] : null);
    if (!width || !height || !band) return;

    const noData = georaster.noDataValue;
    // Map UI threshold (0..1) to raster scale (min..max)
    let appliedThreshold = thresholdNormalized;
    if (typeof rasterValueMin === 'number' && typeof rasterValueMax === 'number') {
        const span = rasterValueMax - rasterValueMin;
        if (span > 0) {
            appliedThreshold = rasterValueMin + thresholdNormalized * span;
        }
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(width, height);
    const data = img.data;

    let p = 0;
    // Overlay color: vivid orange for visibility over light basemaps
    const overlayR = 255, overlayG = 94, overlayB = 0;
    for (let y = 0; y < height; y++) {
        const row = band[y];
        for (let x = 0; x < width; x++) {
            const v = row[x];
            // If using smoothedBand, treat values as valid 0..1; otherwise apply nodata check
            const valid = (band === smoothedBand) ? true : (typeof v === 'number' && !isNaN(v) && (noData === undefined || v !== noData));
            const isOn = valid && v >= appliedThreshold; // align with TIFF pixel values (or smoothed density)
            data[p++] = overlayR;  // R
            data[p++] = overlayG;  // G
            data[p++] = overlayB;  // B
            data[p++] = isOn ? 255 : 0; // A
        }
    }
    // Persist RGBA buffer for export
    try {
        lastOverlayRGBA = img && img.data ? new Uint8ClampedArray(img.data) : null;
        lastOverlayWidth = width;
        lastOverlayHeight = height;
    } catch (_) {}
    ctx.putImageData(img, 0, 0);
    const url = canvas.toDataURL('image/png');

    if (!imageOverlayLayer || !replaceExisting) {
        imageOverlayLayer = L.imageOverlay(url, overlayBounds, {
            pane: 'slumRasterPane',
            opacity: 1.0,
            interactive: false,
            className: 'slum-overlay-img'
        });
        imageOverlayLayer.addTo(map);
    } else {
        // Efficiently update the image without re-adding the layer
        if (typeof imageOverlayLayer.setUrl === 'function') {
            imageOverlayLayer.setUrl(url);
        } else {
            // Fallback: replace the layer entirely
            try { map.removeLayer(imageOverlayLayer); } catch (_) {}
            imageOverlayLayer = L.imageOverlay(url, overlayBounds, {
                pane: 'slumRasterPane',
                opacity: 1.0,
                interactive: false,
                className: 'slum-overlay-img'
            });
            imageOverlayLayer.addTo(map);
        }
    }

    // Restore opacity from UI control if present
    const overlayOpacityEl = document.getElementById('overlayOpacity');
    if (overlayOpacityEl) {
        const v = Math.max(0, Math.min(100, parseInt(overlayOpacityEl.value, 10) || 0));
        setOverlayOpacity(v / 100);
    }

    lastRenderedThreshold = thresholdNormalized;
    // Recompute focus mask to match overlay bounds
    try { updateFocusMask(); } catch (_) {}
    // Hide loading overlay once the raster overlay is ready
    hideLoading();
}

// (Removed PNG/JSON export helpers as we now export TIFF only)

// Helper: build and add the raster layer at a specific internal sampling resolution
function createAndAddRasterLayer(georaster, resolution = 8, replace = false) {
    // Remove existing raster layer if requested
    if (replace && rasterLayer) {
        try { map.removeLayer(rasterLayer); } catch (_) {}
        rasterLayer = null;
    }
    rasterLayer = new GeoRasterLayer({
        georaster,
        pane: 'slumRasterPane',
        opacity: 0.85,
        resolution: resolution,
        updateWhenZooming: false,
        pixelValuesToColorFn: function (values) {
            const v = values && values.length ? values[0] : 0;
            if (isNaN(v) || v === 0) return null; // transparent for background
            return 'rgba(255,94,0,0.95)';
        }
    });
    rasterLayer.addTo(map);
}

// Choose detail based on zoom: more detail when zoomed in
function getResolutionForZoom(zoom) {
    if (zoom >= 16) return 1;
    if (zoom >= 15) return 2;
    if (zoom >= 14) return 3;
    if (zoom >= 13) return 4;
    if (zoom >= 12) return 6;
    return 8;
}

function loadSlumMarkers() {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    return;

    // Get current city data
    const cityData = mockSlumData[currentCity] || [];
    console.log(`Loading markers for ${currentCity}:`, cityData); // Debug log

    // Add all markers (no filtering for now)
    cityData.forEach(slum => {
        const marker = createSlumMarker(slum);
        markers.push(marker);
        marker.addTo(map);
        console.log(`Added marker for ${slum.name} at [${slum.lat}, ${slum.lng}]`); // Debug log
    });

    console.log(`Total markers added: ${markers.length}`); // Debug log
    // Apply visibility based on current threshold
    updateMarkerVisibility(currentThreshold);
    updateStats();
}

function shouldShowSlum(slum, activeFilters, maxPopulation) {
    // Always show all markers regardless of filters for now
    return true;
}

function getActiveFilters() {
    const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.dataset.severity);
}

function createSlumMarker(slum) {
    // Create a custom circular marker with better styling
    const icon = L.divIcon({
        className: `slum-marker`,
        html: '<div class="marker-dot"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
    });
    const marker = L.marker([slum.lat, slum.lng], {
        icon: icon,
        confidence: slum.confidence // Store confidence in marker options
    });

    // Create popup content
    const popupContent = `
        <div style="min-width: 220px; background: #1a1f2e; color: #ffffff; padding: 1rem; border: 1px solid #2d3748;">
            <h3 style="margin: 0 0 12px 0; color: #ffffff; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700;">${slum.name}</h3>
            <p style="margin: 6px 0; color: #a0aec0; font-size: 0.8rem;"><strong>LOCATION:</strong> ${slum.city}, ${slum.state}</p>
            <p style="margin: 6px 0; color: #a0aec0; font-size: 0.8rem;"><strong>POPULATION:</strong> ${slum.population.toLocaleString()}</p>
            <p style="margin: 6px 0; color: #a0aec0; font-size: 0.8rem;"><strong>CONFIDENCE:</strong> <span style="color: #00d4ff; font-weight: 700;">${(slum.confidence * 100).toFixed(1)}%</span></p>
            <p style="margin: 12px 0 8px 0; color: #94a3b8; font-size: 0.75rem; line-height: 1.4;">${slum.description}</p>
            <button onclick="showDetailedInfo(${slum.id})" style="background: #2d3748; color: #00d4ff; border: 1px solid #4a5568; padding: 8px 12px; border-radius: 0; cursor: pointer; margin-top: 8px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'Inter', monospace; transition: all 0.2s ease;">ANALYZE</button>
        </div>
    `;

    marker.bindPopup(popupContent);

    // Add click event for sidebar update
    marker.on('click', function () {
        updateSelectedArea(slum);
        updateAIRecommendations(slum);
    });

    return marker;
}

function getSeverityColor(severity) {
    switch (severity) {
        case 'high':
            return '#fc8181';
        case 'medium':
            return '#f6ad55';
        case 'low':
            return '#68d391';
        default:
            return '#a0aec0';
    }
}

function updateSelectedArea(slum) {
    const selectedArea = document.getElementById('selectedArea');
    if (!selectedArea) return; // panel removed from UI
    const riskLevel = slum.severity === 'high' ? 'CRITICAL' : slum.severity === 'medium' ? 'MODERATE' : 'LOW';
    const infrastructureScore = Math.floor(Math.random() * 40) + 30;
    const sanitationIndex = Math.floor(Math.random() * 50) + 25;

    selectedArea.innerHTML = `
        <h4>${slum.name.toUpperCase()}</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin: 1rem 0;">
            <div style="text-align: center; padding: 0.5rem; background: rgba(15, 23, 42, 0.4); border-radius: 4px;">
                <div style="font-size: 1.1rem; font-weight: 700; color: #3b82f6;">${slum.population.toLocaleString()}</div>
                <div style="font-size: 0.7rem; color: #64748b; text-transform: uppercase;">Population</div>
            </div>
            <div style="text-align: center; padding: 0.5rem; background: rgba(15, 23, 42, 0.4); border-radius: 4px;">
                <div style="font-size: 1.1rem; font-weight: 700; color: ${getSeverityColor(slum.severity)};">${riskLevel}</div>
                <div style="font-size: 0.7rem; color: #64748b; text-transform: uppercase;">Risk Level</div>
            </div>
            <div style="background:#1a1f2e;border:1px solid #2d3748;padding:0.75rem;">
                <div style="font-size:0.75rem;color:#94a3b8;">SANITATION INDEX</div>
                <div style="font-weight:700;color:#fff;">${sanitationIndex}</div>
            </div>
        </div>
        <p style="margin: 1rem 0; font-size: 0.85rem; color: #94a3b8; line-height: 1.6;">${slum.description}</p>
        <button onclick="showDetailedInfo(${slum.id})" style="background: #1a1f2e; color: #00d4ff; border: 1px solid #2d3748; padding: 12px 16px; border-radius: 0; cursor: pointer; width: 100%; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'Inter', monospace; transition: all 0.2s ease;">DETAILED ANALYSIS</button>
    `;
}

function showDetailedInfo(slumId) {
    // Look up slum in the current city's dataset
    const cityData = mockSlumData[currentCity] || [];
    const slum = cityData.find(s => s.id === slumId);
    if (!slum) return;

    const modal = document.getElementById('infoModal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <h2 style="color: #ffffff; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; border-bottom: 2px solid #2d3748; padding-bottom: 1rem;">${slum.name} - COMPREHENSIVE ANALYSIS</h2>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
            <div style="background: #1e2532; padding: 1.5rem; border: 1px solid #2d3748;">
                <h4 style="color: #00d4ff; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; font-size: 0.9rem;">LOCATION INTELLIGENCE</h4>
                <p style="margin-bottom: 0.5rem; color: #e2e8f0; font-size: 0.85rem;"><strong>CITY:</strong> ${slum.city}</p>
                <p style="margin-bottom: 0.5rem; color: #e2e8f0; font-size: 0.85rem;"><strong>STATE:</strong> ${slum.state}</p>
                <p style="margin-bottom: 0.5rem; color: #e2e8f0; font-size: 0.85rem;"><strong>COORDINATES:</strong> ${slum.lat.toFixed(4)}, ${slum.lng.toFixed(4)}</p>
            </div>
            <div style="background: #1e2532; padding: 1.5rem; border: 1px solid #2d3748;">
                <h4 style="color: #00d4ff; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; font-size: 0.9rem;">DEMOGRAPHIC DATA</h4>
                <p style="margin-bottom: 0.5rem; color: #e2e8f0; font-size: 0.85rem;"><strong>POPULATION:</strong> ${slum.population.toLocaleString()}</p>
                <p style="margin-bottom: 0.5rem; color: #e2e8f0; font-size: 0.85rem;"><strong>RISK LEVEL:</strong> <span style="color: ${getSeverityColor(slum.severity)}; font-weight: 700; text-transform: uppercase;">${slum.severity}</span></p>
                <p style="margin-bottom: 0.5rem; color: #e2e8f0; font-size: 0.85rem;"><strong>DENSITY:</strong> ${Math.round(slum.population / 100)} per hectare</p>
            </div>
        </div>

        <div style="margin-bottom: 2rem; background: #1e2532; padding: 1.5rem; border: 1px solid #2d3748;">
            <h4 style="color: #00d4ff; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; font-size: 0.9rem;">SETTLEMENT PROFILE</h4>
            <p style="line-height: 1.6; color: #a0aec0; font-size: 0.85rem;">${slum.description}</p>
        </div>

        <div style="margin-bottom: 2rem; background: #1e2532; padding: 1.5rem; border: 1px solid #2d3748;">
            <h4 style="color: #00d4ff; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; font-size: 0.9rem;">SYSTEM ANALYSIS</h4>
            <div style="background: #1a1f2e; padding: 1.5rem; border-left: 4px solid #00d4ff;">
                <p style="margin-bottom: 0.75rem; color: #e2e8f0; font-size: 0.85rem;"><strong>INFRASTRUCTURE SCORE:</strong> <span style="color: #00d4ff; font-family: 'Inter', monospace; font-weight: 700;">${Math.floor(Math.random() * 40) + 30}/100</span></p>
                <p style="margin-bottom: 0.75rem; color: #e2e8f0; font-size: 0.85rem;"><strong>SANITATION INDEX:</strong> <span style="color: #00d4ff; font-family: 'Inter', monospace; font-weight: 700;">${Math.floor(Math.random() * 50) + 25}/100</span></p>
                <p style="margin-bottom: 0.75rem; color: #e2e8f0; font-size: 0.85rem;"><strong>ECONOMIC ACTIVITY:</strong> <span style="color: #00d4ff; font-family: 'Inter', monospace; font-weight: 700;">${Math.floor(Math.random() * 60) + 40}/100</span></p>
                <p style="color: #e2e8f0; font-size: 0.85rem;"><strong>INTERVENTION PRIORITY:</strong> <span style="color: ${getSeverityColor(slum.severity)}; font-weight: 700; text-transform: uppercase;">${slum.severity === 'high' ? 'IMMEDIATE' : slum.severity === 'medium' ? 'MEDIUM-TERM' : 'LONG-TERM'}</span></p>
            </div>
        </div>

        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
            <button onclick="focusOnSlum(${slum.lat}, ${slum.lng})" style="background: #2d3748; color: #00d4ff; border: 1px solid #4a5568; padding: 12px 24px; border-radius: 0; cursor: pointer; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">MAP FOCUS</button>
            <button onclick="closeModal()" style="background: #1a1f2e; color: #ffffff; border: 1px solid #2d3748; padding: 12px 24px; border-radius: 0; cursor: pointer; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">CLOSE</button>
        </div>
    `;
    modal.style.display = 'block';
}

function focusOnSlum(lat, lng) {
    map.setView([lat, lng], 12);
    closeModal();
}

function closeModal() {
    document.getElementById('infoModal').style.display = 'none';
}

function updateStats() {
    const visibleMarkers = markers.filter(marker => marker._map);
    const totalVisible = visibleMarkers.length;
    const closestData = modelPerformanceData.reduce((prev, curr) =>
        Math.abs(curr.threshold - currentThreshold) < Math.abs(prev.threshold - currentThreshold) ? curr : prev
    );
    const pEl = document.getElementById('precisionValue'); if (pEl) pEl.textContent = closestData.precision.toFixed(2);
    const rEl = document.getElementById('recallValue'); if (rEl) rEl.textContent = closestData.recall.toFixed(2);
    const f1El = document.getElementById('f1Value'); if (f1El) f1El.textContent = closestData.f1.toFixed(2);
}

function setupEventListeners() {
    // Removed dynamic resampling on zoom to keep overlay visually stable.

    // Add map event listeners for POI refresh
    if (map) {
        let refreshTimeout;
        map.on('moveend', () => {
            // Debounce POI refresh to avoid excessive requests
            clearTimeout(refreshTimeout);
            refreshTimeout = setTimeout(() => {
                refreshActivePOILayers();
            }, 500);
        });
    }

    const citySelector = document.getElementById('citySelector');
    if (citySelector) {
        citySelector.addEventListener('change', (e) => {
            changeCity(e.target.value);
        });
    }

    // POI layer toggles
    const toiletsToggle = document.getElementById('toggleToilets');
    if (toiletsToggle) {
        toiletsToggle.addEventListener('change', (e) => {
            toggleBinaryTifLayer('publicToilets', !!e.target.checked);
        });
    }
    const landfillsPolyToggle = document.getElementById('toggleLandfillsPolygons');
    if (landfillsPolyToggle) {
        landfillsPolyToggle.addEventListener('change', (e) => {
            togglePOILayer('landfillsPolygons', !!e.target.checked);
        });
    }
    const schoolsPointToggle = document.getElementById('toggleSchoolsPoints');
    if (schoolsPointToggle) {
        schoolsPointToggle.addEventListener('change', (e) => {
            toggleBinaryTifLayer('welfareCanteens', !!e.target.checked);
        });
    }
    const thresholdRange = document.getElementById('thresholdRange');
    const thresholdInput = document.getElementById('thresholdInput');
    thresholdRange.addEventListener('input', (e) => {
        const value = e.target.value / 100;
        thresholdInput.value = value.toFixed(2);
        updateThreshold(value);
    });
    thresholdInput.addEventListener('input', (e) => {
        let value = parseFloat(e.target.value);
        if (isNaN(value)) value = 0.5;
        if (value < 0) value = 0;
        if (value > 1) value = 1;
        thresholdRange.value = value * 100;
        thresholdInput.value = value.toFixed(2);
        updateThreshold(value);
    });
    document.getElementById('resetView').addEventListener('click', () => {
        const cityCoords = cityManager ? cityManager.getCityCoordinates() : { lat: 19.0760, lng: 72.8777, zoom: 11 };
        map.setView(
            [cityCoords.lat, cityCoords.lng],
            cityCoords.zoom,
            { animate: true, duration: 0.5 }
        );
    });
    // Overlay toggle and opacity
    const overlayToggle = document.getElementById('overlayToggle');
    if (overlayToggle) {
        overlayToggle.addEventListener('change', (e) => {
            setOverlayVisibility(!!e.target.checked);
        });
    }
    const overlayOpacity = document.getElementById('overlayOpacity');
    if (overlayOpacity) {
        overlayOpacity.addEventListener('input', (e) => {
            const v = Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0));
            setOverlayOpacity(v / 100);
            const ovEl = document.getElementById('overlayOpacityValue');
            if (ovEl) ovEl.textContent = `${v}%`;
        });
    }
    // Export TIFF button
    const exportTiffBtn = document.getElementById('exportTiffBtn');
    if (exportTiffBtn) {
        exportTiffBtn.addEventListener('click', exportOverlayTiff);
    }
    // Background dimming control
    const bgDimRange = document.getElementById('bgDimRange');
    if (bgDimRange) {
        bgDimRange.addEventListener('input', (e) => {
            const v = Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0));
            applyBackgroundDimming(v);
            const bgValEl = document.getElementById('bgDimValue');
            if (bgValEl) bgValEl.textContent = `${v}%`;
        });
    }
    // Focus mask toggle
    const focusMaskToggle = document.getElementById('focusMaskToggle');
    if (focusMaskToggle) {
        focusMaskToggle.addEventListener('change', () => updateFocusMask());
    }
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', function (event) {
        const modal = document.getElementById('infoModal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

function updateRiskCounts(visibleSlums) {
    const highCount = visibleSlums.filter(s => s.severity === 'high').length;
    const mediumCount = visibleSlums.filter(s => s.severity === 'medium').length;
    const lowCount = visibleSlums.filter(s => s.severity === 'low').length;

    document.getElementById('highCount').textContent = highCount;
    document.getElementById('mediumCount').textContent = mediumCount;
    document.getElementById('lowCount').textContent = lowCount;
}

function getActiveFilters() {
    const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.dataset.severity);
}

function changeCity(cityKey) {
    if (!cityManager) {
        console.error('CityManager not initialized');
        return;
    }

    const city = cityManager.setCurrentCity(cityKey);
    if (!city) {
        console.error('City not found:', cityKey);
        return;
    }

    currentCity = cityKey;
    const cityCoords = city.coordinates;

    // Update map view
    map.setView([cityCoords.lat, cityCoords.lng], cityCoords.zoom);

    // Reload markers for new city
    loadSlumMarkers();

    // Log city change
    if (window.db) {
        db.logUserActivity({
            type: 'city_changed',
            data: {
                from: cityManager.getCurrentCity()?.key,
                to: cityKey,
                timestamp: new Date().toISOString()
            }
        });
    }
}

function updateThreshold(threshold) {
    currentThreshold = threshold;

    // Find closest performance data point
    const closestData = modelPerformanceData.reduce((prev, curr) =>
        Math.abs(curr.threshold - threshold) < Math.abs(prev.threshold - threshold) ? curr : prev
    );

    // Update display values
    document.getElementById('thresholdValue').textContent = threshold.toFixed(2);
    document.getElementById('precisionValue').textContent = closestData.precision.toFixed(2);
    document.getElementById('recallValue').textContent = closestData.recall.toFixed(2);
    document.getElementById('f1Value').textContent = closestData.f1.toFixed(2);

    // Sync slider and input
    document.getElementById('thresholdRange').value = Math.round(threshold * 100);
    document.getElementById('thresholdInput').value = threshold.toFixed(2);

    // Re-render GeoTIFF-based overlay using this threshold
    if (cachedGeoRaster && overlayBounds) {
        try { renderImageOverlayFromRaster(threshold, true); } catch (_) {}
    }

    // Update marker visibility based on confidence threshold
    updateMarkerVisibility(threshold);
}

function updateMarkerVisibility(threshold) {
    return;
    // Show/hide markers based on confidence threshold
    markers.forEach(marker => {
        const confidence = marker.options.confidence;
        const shouldShow = markersVisible && (confidence >= threshold);

        if (shouldShow && !marker._map) {
            marker.addTo(map);
        } else if (!shouldShow && marker._map) {
            map.removeLayer(marker);
        }
    });
}

// Apply dimming to base map to help overlay stand out
function applyBackgroundDimming(value) {
    // value: 0..100 (0 = no dim, 100 = heavy dim)
    const pane = map && map.getPane ? map.getPane('baseMapPane') : null;
    if (!pane) return;
    // Map slider to brightness range ~ [1.0 .. 0.5]; contrast ~ [1.0 .. 1.05]
    const brightness = Math.max(0.5, 1.0 - (value / 100) * 0.5);
    const contrast = 1.0 + (value / 100) * 0.05;
    pane.style.filter = `brightness(${brightness}) contrast(${contrast})`;
}

function updateAnalyticsOverview(visibleSlums, avgPopulation) {
    const totalVisible = document.getElementById('totalVisible');
    const avgPopulationEl = document.getElementById('avgPopulation');
    const riskDistribution = document.getElementById('riskDistribution');
    
    if (totalVisible) totalVisible.textContent = visibleSlums;
    if (avgPopulationEl) {
        avgPopulationEl.textContent = avgPopulation;
    }
    
    const highRiskCount = visibleSlums.filter(s => s.severity === 'high').length;
    const highRiskPercentage = visibleSlums.length > 0 ? 
        Math.round((highRiskCount / visibleSlums.length) * 100) : 0;
    if (riskDistribution) riskDistribution.textContent = highRiskPercentage + '%';
}

function updatePopulationInsights(visibleSlums) {
    const medianPop = document.getElementById('medianPop');
    const maxPop = document.getElementById('maxPop');
    
    if (visibleSlums.length > 0) {
        const populations = visibleSlums.map(s => s.population).sort((a, b) => a - b);
        const median = populations[Math.floor(populations.length / 2)];
        const max = Math.max(...populations);
        
        if (medianPop) {
            medianPop.textContent = median >= 1000000 ? 
                (median / 1000000).toFixed(1) + 'M' : 
                (median / 1000).toFixed(0) + 'K';
        }
        if (maxPop) {
            maxPop.textContent = max >= 1000000 ? 
                (max / 1000000).toFixed(1) + 'M' : 
                (max / 1000).toFixed(0) + 'K';
        }
    }
}

function updateAIRecommendations(selectedSlum) {
    const recommendations = [
        {
            priority: selectedSlum.severity === 'high' ? 'HIGH' : 'MED',
            text: `Prioritize ${selectedSlum.name} intervention`,
            active: true
        },
        {
            priority: 'MED',
            text: `Assess ${selectedSlum.city} infrastructure`,
            active: false
        },
        {
            priority: 'LOW',
            text: `Monitor ${selectedSlum.state} trends`,
            active: false
        }
    ];
    
    const insightList = document.querySelector('.insight-list');
    if (insightList) {
        insightList.innerHTML = recommendations.map((rec) => {
            const priorityClass = rec.priority === 'HIGH' ? 'high' : (rec.priority === 'MED' ? 'med' : 'low');
            return `
                <div class="insight-item ${rec.active ? 'active' : ''}">
                    <span class="insight-priority ${priorityClass}">${rec.priority}</span>
                    <span class="insight-text">${rec.text}</span>
                </div>
            `;
        }).join('');
    }
}

function exportAnalyticsData() {
    const activeFilters = getActiveFilters();
    const maxPopulation = parseInt(document.getElementById('populationRange').value);
    
    // Get current city data
    const cityData = mockSlumData[currentCity] || [];
    const visibleSlums = cityData.filter(slum => 
        shouldShowSlum(slum, activeFilters, maxPopulation)
    );
    
    const exportData = {
        timestamp: new Date().toISOString(),
        filters: {
            riskLevels: activeFilters,
            maxPopulation: maxPopulation
        },
        summary: {
            totalSettlements: visibleSlums.length,
            totalPopulation: visibleSlums.reduce((sum, slum) => sum + slum.population, 0),
            cities: [...new Set(visibleSlums.map(slum => slum.city))].length,
            riskDistribution: {
                high: visibleSlums.filter(s => s.severity === 'high').length,
                medium: visibleSlums.filter(s => s.severity === 'medium').length,
                low: visibleSlums.filter(s => s.severity === 'low').length
            }
        },
        settlements: visibleSlums.map(slum => ({
            id: slum.id,
            name: slum.name,
            city: slum.city,
            state: slum.state,
            population: slum.population,
            riskLevel: slum.severity,
            coordinates: [slum.lat, slum.lng],
            description: slum.description
        }))
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `slum-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Show success message
    alert('DATA EXPORT COMPLETE: Analytics data has been successfully exported. The JSON file contains comprehensive settlement data and analysis metrics.');
}

// Initialize range value display
// Function to download the current map view as an image
function downloadMapImage() {
    // Use html2canvas to capture the map container
    const mapContainer = document.querySelector('.map-container');
    
    // Show loading state
    const originalText = document.getElementById('exportMapImageBtn').textContent;
    document.getElementById('exportMapImageBtn').textContent = 'Preparing...';
    document.getElementById('exportMapImageBtn').disabled = true;
    
    // Use html2canvas to capture the map
    html2canvas(mapContainer, {
        useCORS: true,
        scale: 2, // Higher scale for better quality
        logging: false,
        backgroundColor: '#0f1419', // Match the map background
        onclone: (clonedDoc) => {
            // Ensure any open popups are visible in the screenshot
            const popups = clonedDoc.querySelectorAll('.leaflet-popup');
            popups.forEach(popup => {
                popup.style.display = 'block';
                popup.style.visibility = 'visible';
            });
        }
    }).then(canvas => {
        // Create download link
        const link = document.createElement('a');
        link.download = `urbisx46_map_${new Date().toISOString().slice(0, 10)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // Reset button state
        document.getElementById('exportMapImageBtn').textContent = originalText;
        document.getElementById('exportMapImageBtn').disabled = false;
    }).catch(error => {
        console.error('Error capturing map:', error);
        alert('Failed to capture map. Please try again.');
        document.getElementById('exportMapImageBtn').textContent = originalText;
        document.getElementById('exportMapImageBtn').disabled = false;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Add html2canvas script if not already loaded
    if (typeof html2canvas !== 'function') {
        const script = document.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        script.onload = function() {
            // Once loaded, add the click handler
            document.getElementById('exportMapImageBtn').addEventListener('click', downloadMapImage);
        };
        document.head.appendChild(script);
    } else {
        document.getElementById('exportMapImageBtn').addEventListener('click', downloadMapImage);
    }
    
    const populationRange = document.getElementById('populationRange');
    const rangeValue = document.getElementById('rangeValue');
    if (populationRange && rangeValue) {
        const value = parseInt(populationRange.value);
        rangeValue.textContent = value >= 1000 ? (value / 1000).toFixed(0) + 'K' : value.toString();
    }
});

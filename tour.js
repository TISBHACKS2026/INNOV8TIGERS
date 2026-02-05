class GuidedTour {
    constructor(steps) {
        this.steps = steps;
        this.currentStep = 0;
        this.modal = document.getElementById('tour-modal');
        this.modalContent = this.modal?.querySelector('.tour-modal__content');
        this.highlightedElement = null;
        this.initialize();
    }

    initialize() {
        // Create tour modal if it doesn't exist
        if (!document.getElementById('tour-modal')) {
            this.createTourModal();
        }

        // Cache DOM elements
        this.elements = {
            modal: document.getElementById('tour-modal'),
            content: document.getElementById('tour-content'),
            title: document.getElementById('tour-title'),
            progress: document.getElementById('tour-progress'),
            prevBtn: document.getElementById('tour-prev'),
            nextBtn: document.getElementById('tour-next'),
            closeBtn: document.querySelector('.tour-close')
        };

        // Add event listeners
        this.addEventListeners();
    }

    createTourModal() {
        // Modal HTML is already in the HTML file
        return true;
    }

    addEventListeners() {
        // Next button
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', () => this.next());
        }

        // Previous button
        if (this.elements.prevBtn) {
            this.elements.prevBtn.addEventListener('click', () => this.previous());
        }

        // Close button
        if (this.elements.closeBtn) {
            this.elements.closeBtn.addEventListener('click', () => this.hide());
        }

        // Close on backdrop click
        if (this.elements.modal) {
            this.elements.modal.addEventListener('click', (e) => {
                if (e.target === this.elements.modal) {
                    this.hide();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;

            switch (e.key) {
                case 'Escape':
                    this.hide();
                    break;
                case 'ArrowLeft':
                    this.previous();
                    break;
                case 'ArrowRight':
                case ' ':
                    this.next();
                    break;
            }
        });
    }

    start() {
        this.currentStep = 0;
        this.showStep(0);
        this.show();
    }

    show() {
        this.isActive = true;
        document.body.style.overflow = 'hidden';
        this.elements.modal.setAttribute('aria-hidden', 'false');

        // Focus the modal for keyboard navigation
        setTimeout(() => {
            this.elements.modal.focus();
        }, 100);
    }

    hide() {
        this.isActive = false;
        document.body.style.overflow = '';
        this.elements.modal.setAttribute('aria-hidden', 'true');
        this.removeHighlight();
    }

    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.showStep(this.currentStep);
        } else {
            this.hide();
        }
    }

    previous() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }

    showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) return;

        const step = this.steps[stepIndex];
        this.currentStep = stepIndex;

        // Update modal content
        if (this.modalContent) {
            this.modalContent.innerHTML = `
                <div class="tour-step" id="tour-step-${stepIndex}">
                    <div class="tour-step__header">
                        <span class="tour-step__icon">${step.icon || '✨'}</span>
                        <h3 class="tour-step__title">${step.title}</h3>
                    </div>
                    <div class="tour-step__content">
                        <p>${step.content}</p>
                    </div>
                    <div class="tour-step__footer">
                        <div class="tour-step__pagination">
                            <span class="tour-step__current">${stepIndex + 1}</span>
                            <span class="tour-step__divider">/</span>
                            <span class="tour-step__total">${this.steps.length}</span>
                        </div>
                        <div class="tour-step__actions">
                            <button class="tour-button tour-button--secondary" id="tour-prev" ${stepIndex === 0 ? 'disabled' : ''}>
                                Previous
                            </button>
                            <button class="tour-button" id="tour-next">
                                ${stepIndex === this.steps.length - 1 ? 'Finish' : 'Next'}
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Add event listeners to the new buttons
            document.getElementById('tour-prev')?.addEventListener('click', () => this.prevStep());
            document.getElementById('tour-next')?.addEventListener('click', () => this.nextStep());
        }

        // Update progress
        const progress = document.getElementById('tour-progress');
        if (progress) {
            progress.textContent = `${stepIndex + 1}/${this.steps.length}`;
        }

        // Position and highlight the target element
        if (step.target) {
            this.highlightElement(step.target, step.position);
        } else {
            this.removeHighlight();
        }

        // Execute step action if defined
        if (typeof step.action === 'function') {
            try {
                step.action();
            } catch (e) {
                console.error('Error executing tour step action:', e);
            }
        }

        // Position the modal based on the target
        this.positionModal(step.target, step.position);
    }

    positionModal(targetSelector, position = 'right') {
        if (!this.modalContent || !targetSelector) return;

        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) return;
        
        const targetRect = targetElement.getBoundingClientRect();
        const modalRect = this.modalContent.getBoundingClientRect();
        const padding = 20;
        
        let top, left;
        
        switch (position) {
            case 'top':
                top = targetRect.top - modalRect.height - padding;
                left = targetRect.left + (targetRect.width / 2) - (modalRect.width / 2);
                break;
            case 'bottom':
                top = targetRect.bottom + padding;
                left = targetRect.left + (targetRect.width / 2) - (modalRect.width / 2);
                break;
            case 'left':
                top = targetRect.top + (targetRect.height / 2) - (modalRect.height / 2);
                left = targetRect.left - modalRect.width - padding;
                break;
            case 'right':
            default:
                top = targetRect.top + (targetRect.height / 2) - (modalRect.height / 2);
                left = targetRect.right + padding;
                break;
        }
        
        // Ensure the modal stays within viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (left < 0) left = padding;
        if (left + modalRect.width > viewportWidth) left = viewportWidth - modalRect.width - padding;
        if (top < 0) top = padding;
        if (top + modalRect.height > viewportHeight) top = viewportHeight - modalRect.height - padding;
        
        this.modalContent.style.top = `${Math.max(padding, top)}px`;
        this.modalContent.style.left = `${Math.max(padding, left)}px`;
    }
    
    highlightElement(selector, position = 'bottom') {
        // First remove any existing highlights
        this.removeHighlight();
        
        // Special handling for map controls which might be in a shadow DOM
        if (selector === '.leaflet-control-zoom') {
            const zoomControl = document.querySelector(selector);
            if (zoomControl) {
                zoomControl.style.zIndex = '1000';
                this.highlightedElement = zoomControl;
                zoomControl.classList.add('tour-highlight');
            }
            return;
        }
        
        // Try direct selector first
        let element = document.querySelector(selector);
        
        // If not found, try to find by text content
        if (!element && selector === '.filter-section h4') {
            const headings = document.querySelectorAll('.filter-section h4');
            const currentTitle = this.steps[this.currentStep]?.title;
            
            if (currentTitle) {
                let targetText = '';
                if (currentTitle.includes('Overlay')) targetText = 'Predicted Slum Overlay';
                if (currentTitle.includes('Background')) targetText = 'Map Background';
                
                if (targetText) {
                    for (const h4 of headings) {
                        if (h4.textContent.includes(targetText)) {
                            element = h4.closest('.filter-section');
                            break;
                        }
                    }
                }
            }
        }
        
        if (!element) return;
        
        // Store reference and add highlight class
        this.highlightedElement = element;
        element.classList.add('tour-highlight');
        
        // Scroll to element with smooth behavior
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
        
        // Special handling for sidebar elements to ensure they're visible
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && !this.isElementInViewport(element)) {
            sidebar.scrollTo({
                top: element.offsetTop - 20,
                behavior: 'smooth'
            });
        }
    }
    
    // Helper method to check if element is in viewport
    isElementInViewport(el) {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    removeHighlight() {
        if (this.highlightedElement) {
            this.highlightedElement.classList.remove('tour-highlight');
            this.highlightedElement = null;
        }
    }
}

// Define tour steps
const tourSteps = [
    {
        title: 'Welcome to the Slum Detection Map',
        content: 'This interactive tour will guide you through the key features of the Slum Detection Map. Use the arrow keys or buttons to navigate.',
        icon: '🗺️',
        target: null
    },
    {
        title: 'Map Navigation',
        content: 'Pan around by clicking and dragging. Use the + and - buttons or your mouse wheel to zoom in and out.',
        icon: '✋',
        target: '.leaflet-control-zoom',
        position: 'bottom',
        action: function() {
            // Ensure map controls are visible
            const zoomControl = document.querySelector('.leaflet-control-zoom');
            if (zoomControl) zoomControl.style.zIndex = '1000';
        }
    },
    {
        title: 'Threshold Control',
        content: 'Adjust the threshold to control which areas are identified as slums. Higher values show only the most certain areas.',
        icon: '🎚️',
        target: '#thresholdSection',
        position: 'right',
        action: function() {
            // Ensure the threshold section is visible
            const section = document.getElementById('thresholdSection');
            if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },
    {
        title: 'Overlay Controls',
        content: 'Toggle the overlay visibility and adjust its opacity to better see the underlying map.',
        icon: '🎨',
        target: '.filter-section h4',
        position: 'right',
        action: function() {
            // Find the overlay section by its heading text
            const headings = document.querySelectorAll('.filter-section h4');
            let overlaySection = null;
            headings.forEach(h4 => {
                if (h4.textContent.includes('Predicted Slum Overlay')) {
                    overlaySection = h4.closest('.filter-section');
                }
            });
            if (overlaySection) {
                overlaySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    },
    {
        title: 'Map Background',
        content: 'Adjust the background dim to make the overlay more or less prominent against the base map.',
        icon: '🌆',
        target: '.filter-section h4',
        position: 'right',
        action: function() {
            // Find the background dim section by its heading text
            const headings = document.querySelectorAll('.filter-section h4');
            let bgSection = null;
            headings.forEach(h4 => {
                if (h4.textContent.includes('Map Background')) {
                    bgSection = h4.closest('.filter-section');
                }
            });
            if (bgSection) {
                bgSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    },
    {
        title: 'Export Options',
        content: 'Export the current overlay as a TIFF file for further analysis in GIS software.',
        icon: '💾',
        target: '.export-buttons',
        position: 'left',
        action: function() {
            const exportSection = document.querySelector('.export-buttons');
            if (exportSection) {
                exportSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    },
    {
        title: 'Need Help?',
        content: 'Click the help button in the bottom-right corner to restart this tour at any time.',
        icon: '❓',
        target: '#startTour',
        position: 'top'
    }
];

// Initialize the tour when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create and initialize the tour
    const tour = new GuidedTour(tourSteps);
    
    // Add click handler for the help button
    const helpButton = document.getElementById('startTour');
    if (helpButton) {
        helpButton.addEventListener('click', (e) => {
            e.preventDefault();
            tour.start();
        });
    }
    
    // Add keyboard shortcut (Shift + ?) to start the tour
    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.key === '?') {
            e.preventDefault();
            tour.start();
        }
    });
    
    // Auto-start tour on first visit (after a short delay)
    if (!sessionStorage.getItem('tourShown')) {
        setTimeout(() => {
            tour.start();
            sessionStorage.setItem('tourShown', 'true');
        }, 2000);
    }
});

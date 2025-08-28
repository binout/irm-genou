class MedicalImageViewer {
    constructor() {
        this.sequenceMetadata = {
            'axial': {
                name: 'Coupes Axiales',
                description: 'Coupes transversales du genou'
            },
            'coronal': {
                name: 'Coupes Coronales', 
                description: 'Coupes frontales du genou'
            },
            'sagittal': {
                name: 'Coupes Sagittales',
                description: 'Coupes sagittales (latérales) du genou'
            },
            'localizer': {
                name: 'Localisateur',
                description: 'Images de localisation anatomique'
            },
            't1-cube': {
                name: 'T1 CUBE',
                description: 'Séquence T1 haute résolution'
            },
            'dp-cube': {
                name: 'DP FS CUBE',
                description: 'Séquence DP avec suppression de graisse'
            }
        };

        this.manifest = null;
        this.currentView = 'grid';
        this.currentSequence = 'all';
        this.currentImage = null;
        this.zoom = 1;
        this.brightness = 100;
        this.contrast = 100;

        this.initializeEventListeners();
        this.loadManifest();
    }

    initializeEventListeners() {
        document.getElementById('sequence-select').addEventListener('change', (e) => {
            this.currentSequence = e.target.value;
            this.filterImages();
        });

        document.getElementById('grid-view').addEventListener('click', () => {
            this.setView('grid');
        });

        document.getElementById('cine-view').addEventListener('click', () => {
            this.setView('cine');
        });

        document.getElementById('brightness').addEventListener('input', (e) => {
            this.brightness = e.target.value;
            this.applyImageAdjustments();
        });

        document.getElementById('contrast').addEventListener('input', (e) => {
            this.contrast = e.target.value;
            this.applyImageAdjustments();
        });

        document.getElementById('reset-adjustments').addEventListener('click', () => {
            this.resetImageAdjustments();
        });

        document.getElementById('zoom-in')?.addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out')?.addEventListener('click', () => this.zoomOut());
        document.getElementById('fit-screen')?.addEventListener('click', () => this.fitToScreen());
        document.getElementById('actual-size')?.addEventListener('click', () => this.actualSize());
        
        document.getElementById('back-to-grid')?.addEventListener('click', () => {
            this.setView('grid');
        });
    }

    async loadManifest() {
        this.showLoading(true);
        
        try {
            const response = await fetch('image-manifest.json');
            this.manifest = await response.json();
            
            await this.loadContent();
        } catch (error) {
            console.error('Failed to load manifest:', error);
            this.showError('Erreur lors du chargement du catalogue d\'images');
        }
        
        this.showLoading(false);
    }

    async loadContent() {
        if (!this.manifest) return;
        
        await this.loadVideos();
        await this.loadImages();
    }

    async loadVideos() {
        const videoGrid = document.getElementById('video-grid');
        videoGrid.innerHTML = '';

        for (const video of this.manifest.videos) {
            const sequenceType = this.getVideoSequenceType(video.title);
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item';
            videoItem.dataset.sequence = sequenceType;
            
            videoItem.innerHTML = `
                <video controls preload="metadata">
                    <source src="${video.file}" type="video/mp4">
                    Votre navigateur ne supporte pas la lecture vidéo.
                </video>
                <div class="video-title">${this.formatVideoTitle(video.title)}</div>
            `;
            
            videoGrid.appendChild(videoItem);
        }
    }

    getVideoSequenceType(title) {
        const titleLower = title.toLowerCase();
        // Check CUBE sequences first (more specific)
        if (titleLower.includes('cube') && titleLower.includes('t1')) return 't1-cube';
        if (titleLower.includes('cube') && (titleLower.includes('dp') || titleLower.includes('fs'))) return 'dp-cube';
        // Then check regular orientations
        if (titleLower.includes('ax')) return 'axial';
        if (titleLower.includes('cor')) return 'coronal';
        if (titleLower.includes('sag')) return 'sagittal';
        if (titleLower.includes('loc')) return 'localizer';
        return 'other';
    }

    formatVideoTitle(title) {
        // Clean up the auto-generated title
        return title
            .replace(/MPR T1/g, 'MPR T1')
            .replace(/AX/g, 'Axial')
            .replace(/CORO/g, 'Coronal')
            .replace(/SAG/g, 'Sagittal')
            .replace(/Loc Droit/g, 'Localisateur Droit')
            .replace(/CUBE DP FS/g, 'CUBE DP FS')
            .replace(/\s+/g, ' ')
            .trim();
    }

    async loadImages() {
        const imageGrid = document.getElementById('image-grid');
        imageGrid.innerHTML = '';

        for (const [sequenceType, sequenceData] of Object.entries(this.manifest.sequences)) {
            const metadata = this.sequenceMetadata[sequenceType] || {
                name: sequenceType,
                description: 'Séquence d\'imagerie médicale'
            };

            // Sample images to avoid loading too many at once
            const imagesToLoad = sequenceData.images.slice(0, Math.min(50, sequenceData.images.length));
            
            for (const image of imagesToLoad) {
                const imageItem = this.createImageElement(image, sequenceType, metadata);
                imageGrid.appendChild(imageItem);
            }
        }
    }

    createImageElement(image, sequenceType, metadata) {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.dataset.sequence = sequenceType;
        
        imageItem.innerHTML = `
            <img src="${image.path}" alt="${image.name}" loading="lazy">
            <div class="image-title">
                <span class="sequence-tag">${metadata.name}</span><br>
                ${image.name}
            </div>
        `;

        imageItem.addEventListener('click', () => {
            this.openImageInViewer(image, metadata, sequenceType);
        });

        return imageItem;
    }

    filterImages() {
        const imageItems = document.querySelectorAll('.image-item');
        const videoItems = document.querySelectorAll('.video-item');
        
        imageItems.forEach(item => {
            if (this.currentSequence === 'all' || item.dataset.sequence === this.currentSequence) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        videoItems.forEach(item => {
            if (this.currentSequence === 'all' || item.dataset.sequence === this.currentSequence) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        this.updateSequenceInfo();
    }

    setView(view) {
        this.currentView = view;
        
        document.querySelectorAll('.view-controls button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Only activate button if it exists (single view has no button)
        const viewButton = document.getElementById(`${view}-view`);
        if (viewButton) {
            viewButton.classList.add('active');
        }

        const imageSection = document.getElementById('image-section');
        const videoSection = document.getElementById('video-section');
        const singleViewer = document.getElementById('single-viewer');
        const imageControls = document.getElementById('image-controls');
        const navigationSection = document.querySelector('.navigation');
        const controlsSection = document.querySelector('.controls');

        switch (view) {
            case 'grid':
                imageSection.style.display = 'block';
                videoSection.style.display = 'none';
                singleViewer.style.display = 'none';
                imageControls.style.display = 'none';
                navigationSection.style.display = 'none';
                controlsSection.style.display = 'flex';
                break;
            case 'single':
                imageSection.style.display = 'none';
                videoSection.style.display = 'none';
                singleViewer.style.display = 'block';
                imageControls.style.display = 'flex';
                navigationSection.style.display = 'block';
                controlsSection.style.display = 'none';
                // sliceNav visibility will be set by setupSliceNavigation when an image is opened
                break;
            case 'cine':
                imageSection.style.display = 'none';
                videoSection.style.display = 'block';
                singleViewer.style.display = 'none';
                imageControls.style.display = 'none';
                navigationSection.style.display = 'none';
                controlsSection.style.display = 'flex';
                break;
        }
    }

    openImageInViewer(image, metadata, sequenceType) {
        this.currentImage = image;
        this.setView('single');
        
        const canvas = document.getElementById('main-canvas');
        const ctx = canvas.getContext('2d');
        
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            
            this.drawImageToCanvas(ctx, img);
            this.updateSequenceDetails(image, metadata, sequenceType);
            this.setupSliceNavigation(sequenceType);
        };
        img.onerror = () => {
            this.showError(`Erreur lors du chargement de l'image: ${image.path}`);
        };
        img.src = image.path;
    }

    setupSliceNavigation(sequenceType) {
        if (!this.manifest || !this.manifest.sequences[sequenceType]) return;
        
        const sliceNav = document.getElementById('slice-nav');
        const sliceSlider = document.getElementById('slice-slider');
        const sliceInfo = document.getElementById('slice-info');
        
        const images = this.manifest.sequences[sequenceType].images;
        const currentIndex = images.findIndex(img => img.path === this.currentImage.path);
        
        if (images.length > 1) {
            sliceNav.style.display = 'block';
            sliceSlider.min = 0;
            sliceSlider.max = images.length - 1;
            sliceSlider.value = currentIndex;
            sliceInfo.textContent = `${currentIndex + 1}/${images.length}`;
            
            sliceSlider.oninput = (e) => {
                const newIndex = parseInt(e.target.value);
                const newImage = images[newIndex];
                sliceInfo.textContent = `${newIndex + 1}/${images.length}`;
                
                // Load new image
                const canvas = document.getElementById('main-canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    this.drawImageToCanvas(ctx, img);
                    this.currentImage = newImage;
                };
                img.src = newImage.path;
            };
        } else {
            sliceNav.style.display = 'none';
        }
    }

    drawImageToCanvas(ctx, img) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        ctx.filter = `brightness(${this.brightness}%) contrast(${this.contrast}%)`;
        ctx.drawImage(img, 0, 0);
    }

    applyImageAdjustments() {
        if (this.currentImage && this.currentView === 'single') {
            const canvas = document.getElementById('main-canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                this.drawImageToCanvas(ctx, img);
            };
            img.src = this.currentImage.path;
        }
    }

    resetImageAdjustments() {
        this.brightness = 100;
        this.contrast = 100;
        document.getElementById('brightness').value = 100;
        document.getElementById('contrast').value = 100;
        this.applyImageAdjustments();
    }

    zoomIn() {
        this.zoom *= 1.2;
        this.applyZoom();
    }

    zoomOut() {
        this.zoom /= 1.2;
        this.applyZoom();
    }

    fitToScreen() {
        this.zoom = 1;
        this.applyZoom();
    }

    actualSize() {
        this.zoom = 1;
        this.applyZoom();
    }

    applyZoom() {
        const canvas = document.getElementById('main-canvas');
        canvas.style.transform = `scale(${this.zoom})`;
        canvas.style.transformOrigin = 'center center';
    }

    updateSequenceDetails(image, metadata, sequenceType) {
        const details = document.getElementById('sequence-details');
        const sequenceImages = this.manifest.sequences[sequenceType]?.images || [];
        const currentIndex = sequenceImages.findIndex(img => img.path === image.path);
        
        details.innerHTML = `
            <h4>${metadata.name}</h4>
            <p><strong>Description:</strong> ${metadata.description}</p>
            <p><strong>Image:</strong> ${image.name}</p>
            <p><strong>Dossier:</strong> ${image.folder}</p>
            <p><strong>Position:</strong> ${currentIndex + 1}/${sequenceImages.length}</p>
            <div class="sequence-tag">${metadata.name}</div>
        `;
    }

    updateSequenceInfo() {
        const visibleImages = document.querySelectorAll('.image-item:not([style*="display: none"])');
        const details = document.getElementById('sequence-details');
        
        if (this.currentSequence === 'all') {
            let totalImages = 0;
            if (this.manifest) {
                totalImages = Object.values(this.manifest.sequences)
                    .reduce((sum, seq) => sum + seq.images.length, 0);
            }
            
            details.innerHTML = `
                <p><strong>Vue d'ensemble:</strong> Toutes les séquences d'imagerie</p>
                <p><strong>Images affichées:</strong> ${visibleImages.length}</p>
                <p><strong>Total d'images:</strong> ${totalImages}</p>
                <p>Sélectionnez une séquence spécifique pour plus de détails</p>
            `;
        } else {
            const metadata = this.sequenceMetadata[this.currentSequence];
            const sequenceData = this.manifest?.sequences[this.currentSequence];
            
            if (metadata && sequenceData) {
                details.innerHTML = `
                    <h4>${metadata.name}</h4>
                    <p><strong>Description:</strong> ${metadata.description}</p>
                    <p><strong>Images dans cette séquence:</strong> ${sequenceData.images.length}</p>
                    <p><strong>Dossiers:</strong> ${sequenceData.folders.join(', ')}</p>
                `;
            }
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        loading.style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: #ff4444;
            color: white;
            padding: 1rem;
            margin: 1rem;
            border-radius: 4px;
            text-align: center;
        `;
        errorDiv.textContent = message;
        
        document.querySelector('.viewer-container').prepend(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MedicalImageViewer();
});
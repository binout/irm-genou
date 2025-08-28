// Node.js script to generate a manifest of all images and videos
const fs = require('fs');
const path = require('path');

function generateManifest() {
    const baseDir = 'Irm_Genou_Sans_Iv__11403';
    const manifest = {
        videos: [],
        sequences: {}
    };

    // Get all files in the base directory
    const items = fs.readdirSync(baseDir);
    
    // Process videos (MP4 files in root)
    items.filter(item => item.endsWith('.mp4')).forEach(video => {
        manifest.videos.push({
            file: `${baseDir}/${video}`,
            title: video.replace('.mp4', '').replace(/_/g, ' ')
        });
    });

    // Process image directories
    items.filter(item => {
        const fullPath = path.join(baseDir, item);
        return fs.statSync(fullPath).isDirectory();
    }).forEach(folder => {
        const folderPath = path.join(baseDir, folder);
        const images = fs.readdirSync(folderPath)
            .filter(file => file.endsWith('.jpg'))
            .sort()
            .map(file => ({
                path: `${baseDir}/${folder}/${file}`,
                name: file.replace('.jpg', ''),
                folder: folder
            }));

        if (images.length > 0) {
            // Determine sequence type based on folder name
            let sequenceType = 'other';
            if (folder.toLowerCase().includes('cube') && folder.toLowerCase().includes('t1')) {
                sequenceType = 't1-cube';
            } else if (folder.toLowerCase().includes('cube') && (folder.toLowerCase().includes('dp') || folder.toLowerCase().includes('fs'))) {
                sequenceType = 'dp-cube';
            } else if (folder.toLowerCase().includes('ax')) {
                sequenceType = 'axial';
            } else if (folder.toLowerCase().includes('cor')) {
                sequenceType = 'coronal';
            } else if (folder.toLowerCase().includes('sag')) {
                sequenceType = 'sagittal';
            } else if (folder.toLowerCase().includes('loc')) {
                sequenceType = 'localizer';
            }

            if (!manifest.sequences[sequenceType]) {
                manifest.sequences[sequenceType] = {
                    folders: [],
                    images: []
                };
            }

            manifest.sequences[sequenceType].folders.push(folder);
            manifest.sequences[sequenceType].images.push(...images);
        }
    });

    return manifest;
}

// Generate and save manifest
const manifest = generateManifest();
fs.writeFileSync('image-manifest.json', JSON.stringify(manifest, null, 2));
console.log('Manifest generated successfully!');
console.log('Videos found:', manifest.videos.length);
console.log('Sequences found:', Object.keys(manifest.sequences).length);
Object.entries(manifest.sequences).forEach(([type, data]) => {
    console.log(`  ${type}: ${data.images.length} images in ${data.folders.length} folders`);
});
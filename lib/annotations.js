/*

Annotations System - Server-side Handler
Manages loading and saving annotations for PDFs and EPUBs

*/

const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const ANNOTATIONS_FILE = path.join(__dirname, '../static/annotations.yaml');

const DEFAULT_NOTE_FONT_SIZE = 13;
const MIN_NOTE_FONT_SIZE = 9;
const MAX_NOTE_FONT_SIZE = 32;

// Inner width of the note, in pixels. The default is what the old fixed
// 450px panel left for its content once its 20px padding was taken off.
const DEFAULT_NOTE_WIDTH = 410;
const MIN_NOTE_WIDTH = 280;
const MAX_NOTE_WIDTH = 1400;

// The whole YAML document, not just its annotations. The file now also carries
// a settings section, and a writer that rebuilt the document from the
// annotations alone would drop it on the next saved note.
function loadDocument() {
    try {
        if (fs.existsSync(ANNOTATIONS_FILE)) {
            const fileContents = fs.readFileSync(ANNOTATIONS_FILE, 'utf8');
            return yaml.load(fileContents) || {};
        }
    } catch (err) {
        console.error('Error loading annotations:', err);
    }
    return {};
}

function writeDocument(doc) {
    try {
        const yamlStr = yaml.dump(doc, {
            indent: 2,
            lineWidth: -1,
            noRefs: true
        });
        fs.writeFileSync(ANNOTATIONS_FILE, yamlStr, 'utf8');
        return true;
    } catch (err) {
        console.error('Error saving annotations:', err);
        return false;
    }
}

// Load annotations from YAML file
function loadAnnotations() {
    return loadDocument().annotations || {};
}

// Save annotations to YAML file
function saveAnnotations(annotations) {
    const doc = loadDocument();
    doc.annotations = annotations;
    return writeDocument(doc);
}

// How the note editor reads: text size and width, shared by every file type
// since one panel serves them all.
function clamp(value, lo, hi, fallback) {
    const n = parseInt(value, 10);
    if (isNaN(n)) return fallback;
    return Math.min(hi, Math.max(lo, n));
}

function loadNoteSettings() {
    const settings = loadDocument().settings || {};
    return {
        fontSize: clamp(settings.note_font_size, MIN_NOTE_FONT_SIZE, MAX_NOTE_FONT_SIZE, DEFAULT_NOTE_FONT_SIZE),
        width: clamp(settings.note_width, MIN_NOTE_WIDTH, MAX_NOTE_WIDTH, DEFAULT_NOTE_WIDTH)
    };
}

// Merges: the two controls move independently, so a change to one must not
// reset the other back to its default.
function saveNoteSettings(patch) {
    const current = loadNoteSettings();
    const next = {
        fontSize: patch.fontSize === undefined ? current.fontSize
            : clamp(patch.fontSize, MIN_NOTE_FONT_SIZE, MAX_NOTE_FONT_SIZE, current.fontSize),
        width: patch.width === undefined ? current.width
            : clamp(patch.width, MIN_NOTE_WIDTH, MAX_NOTE_WIDTH, current.width)
    };
    const doc = loadDocument();
    doc.settings = doc.settings || {};
    doc.settings.note_font_size = next.fontSize;
    doc.settings.note_width = next.width;
    return writeDocument(doc) ? next : null;
}

// Generate unique annotation ID
function generateAnnotationId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ann-${timestamp}-${random}`;
}

// Socket.io event handlers
function setupAnnotationHandlers(io) {
    io.on('connection', function(socket) {

        // Get all annotations for a specific file
        socket.on('get_annotations', function(filePath) {
            try {
                // Fix filePath if it's just "/" to avoid YAML parsing issues
                if (filePath === '/' || filePath === '') {
                    filePath = 'page-root';
                }
                const allAnnotations = loadAnnotations();
                const fileAnnotations = allAnnotations[filePath] || [];
                socket.emit('annotations_loaded', JSON.stringify({
                    filePath: filePath,
                    annotations: fileAnnotations
                }));
            } catch (err) {
                console.error('Error getting annotations:', err);
                socket.emit('annotation_error', 'Failed to load annotations');
            }
        });

        // Save a new annotation
        socket.on('save_annotation', function(annotationData) {
            try {
                const data = JSON.parse(annotationData);
                // Fix filePath if it's just "/" to avoid YAML parsing issues
                let filePath = data.filePath;
                if (filePath === '/' || filePath === '') {
                    filePath = 'page-root';
                }
                const annotation = data.annotation;

                // Generate ID if not present
                if (!annotation.id) {
                    annotation.id = generateAnnotationId();
                }

                // Add timestamp if not present
                if (!annotation.timestamp) {
                    annotation.timestamp = new Date().toISOString();
                }

                const allAnnotations = loadAnnotations();

                // Initialize array for this file if it doesn't exist
                if (!allAnnotations[filePath]) {
                    allAnnotations[filePath] = [];
                }

                // Check if updating existing annotation
                const existingIndex = allAnnotations[filePath].findIndex(
                    ann => ann.id === annotation.id
                );

                if (existingIndex !== -1) {
                    // Update existing annotation
                    allAnnotations[filePath][existingIndex] = annotation;
                } else {
                    // Add new annotation
                    allAnnotations[filePath].push(annotation);
                }

                // Save to file
                if (saveAnnotations(allAnnotations)) {
                    socket.emit('annotation_saved', JSON.stringify({
                        success: true,
                        annotation: annotation
                    }));

                    // Broadcast to OTHER clients only (not the sender)
                    // DISABLED to prevent duplicates when single user
                    // socket.broadcast.emit('annotation_updated', JSON.stringify({
                    //     filePath: filePath,
                    //     annotation: annotation
                    // }));
                } else {
                    socket.emit('annotation_error', 'Failed to save annotation');
                }

            } catch (err) {
                console.error('Error saving annotation:', err);
                socket.emit('annotation_error', 'Failed to save annotation: ' + err.message);
            }
        });

        // Delete an annotation
        socket.on('delete_annotation', function(deleteData) {
            try {
                const data = JSON.parse(deleteData);
                // Fix filePath if it's just "/" to avoid YAML parsing issues
                let filePath = data.filePath;
                if (filePath === '/' || filePath === '') {
                    filePath = 'page-root';
                }
                const annotationId = data.annotationId;

                const allAnnotations = loadAnnotations();

                if (allAnnotations[filePath]) {
                    // Filter out the annotation to delete
                    allAnnotations[filePath] = allAnnotations[filePath].filter(
                        ann => ann.id !== annotationId
                    );

                    // Remove file entry if no annotations left
                    if (allAnnotations[filePath].length === 0) {
                        delete allAnnotations[filePath];
                    }

                    // Save to file
                    if (saveAnnotations(allAnnotations)) {
                        socket.emit('annotation_deleted', JSON.stringify({
                            success: true,
                            annotationId: annotationId
                        }));

                        // Broadcast to all clients
                        io.emit('annotation_removed', JSON.stringify({
                            filePath: filePath,
                            annotationId: annotationId
                        }));
                    } else {
                        socket.emit('annotation_error', 'Failed to delete annotation');
                    }
                } else {
                    socket.emit('annotation_error', 'No annotations found for this file');
                }

            } catch (err) {
                console.error('Error deleting annotation:', err);
                socket.emit('annotation_error', 'Failed to delete annotation: ' + err.message);
            }
        });

        // Get all annotations (for admin/debugging)
        socket.on('get_note_settings', function() {
            socket.emit('note_settings_loaded', JSON.stringify(loadNoteSettings()));
        });

        socket.on('set_note_settings', function(payload) {
            let patch;
            try { patch = JSON.parse(payload); }
            catch (e) { console.error('[annotations] Invalid JSON in set_note_settings:', e.message); return; }
            const saved = saveNoteSettings(patch);
            if (saved === null) return;
            // Every open viewer shares the setting, so tell them all.
            io.emit('note_settings_loaded', JSON.stringify(saved));
        });

        socket.on('get_all_annotations', function() {
            try {
                const allAnnotations = loadAnnotations();
                socket.emit('all_annotations_loaded', JSON.stringify(allAnnotations));
            } catch (err) {
                console.error('Error getting all annotations:', err);
                socket.emit('annotation_error', 'Failed to load all annotations');
            }
        });

    });
}

module.exports = {
    setupAnnotationHandlers: setupAnnotationHandlers,
    loadAnnotations: loadAnnotations,
    saveAnnotations: saveAnnotations
};

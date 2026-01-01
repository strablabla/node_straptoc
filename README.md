# Node Straptoc

A feature-rich Node.js web application for markdown-based content management with real-time collaboration, media playback, and organizational tools.

## Overview

Node Straptoc is a sophisticated personal information management system that combines markdown editing, media management, task organization, and collaborative features in a unified web interface. Built with Node.js and Express, it provides a powerful platform for content authoring with support for videos, PDFs, e-books, voice commands, and mathematical notation.

## Features

### Content Management
- **Markdown Editor**: Advanced markdown editing with live preview
- **Version Control**: Automatic backups every 15 minutes with version history
- **Multiple Pages**: Manage multiple sections and documents
- **Search**: Full-text search across all content
- **Color Tags**: 20+ predefined categories for organizing content (job, prog, phys, math, ML, etc.)

### Media Capabilities
- **Video Player**: Support for YouTube and local video files
- **PDF Viewer**: Built-in PDF document viewer
- **DJVU Reader**: View DJVU format documents
- **EPUB Reader**: Read e-books in EPUB format
- **Image Galleries**: Portfolio management with carousels
- **Audio Playback**: Integrated audio player

### Organizational Tools
- **Agenda**: Calendar-based task and event management with time-based alerts
- **Notes**: Timestamped note-taking with real-time synchronization
- **Chat**: Real-time messaging between connected users
- **Store**: Data persistence and synchronization

### Advanced Features
- **Voice Commands**: Voice recognition and control using Artyom.js
- **Mathematical Notation**: LaTeX rendering with MathLive
- **Real-time Collaboration**: WebSocket-based synchronization via Socket.io
- **Interactive Table of Contents**: Auto-generated navigation
- **Context Menus**: Right-click functionality throughout the interface

## Technology Stack

### Backend
- **Node.js** with Express.js (^4.16.4)
- **Socket.io** (^4.8.1) - Real-time communication
- **SQLite3** (^5.1.7) - User database
- **Nunjucks** (^3.2.0) - Template engine
- **js-yaml** (^4.1.0) - Configuration parsing
- **HTTPS** - SSL/TLS encryption

### Frontend
- **jQuery** & **jQuery UI** - DOM manipulation and UI widgets
- **Bootstrap** - CSS framework
- **D3.js** - Data visualization
- **CodeMirror** - Code editor with syntax highlighting
- **MathLive** - Mathematical notation rendering
- **Artyom.js** - Voice recognition
- **DJVU.js**, **EPUB.js** - Document readers
- **Alertify.js** - Notifications
- **Font Awesome** - Icons

## Installation

### Prerequisites
- Node.js (v12 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/strablabla/node_straptoc.git
cd node_straptoc
```

2. Install dependencies:
```bash
npm install
```

3. Generate SSL certificates for HTTPS (or use existing ones):
```bash
# Place your SSL certificate files in the project root:
# - key.pem (private key)
# - server.crt (certificate)
```

4. Configure the application:
   - Edit [static/config.yaml](static/config.yaml) to customize:
     - File paths and directories
     - Color tags
     - Voice command vocabulary
     - UI settings

5. Start the server:
```bash
node html_app.js
```

6. Access the application:
   - Open your browser and navigate to `https://localhost:3001`
   - Accept the self-signed certificate warning (for development)

## Configuration

The application uses a centralized YAML configuration file: [static/config.yaml](static/config.yaml)

### Configuration Sections:
- **addresses**: Static file paths and directories
- **color_tags**: Category definitions for content organization
- **vocabulaire**: Hierarchical voice command vocabulary
- **subtitles_path**: Path to subtitle files
- **config**: UI styling and page properties

### Additional Configuration Files:
- `agenda.yaml` - Calendar events and tasks
- `notes.json` - User notes
- `pages.json` - Available pages
- `drawing_state.json` - Canvas drawing state
- `latex_voc.json` - LaTeX voice commands
- `strap_database.db` - SQLite user database

## Project Structure

```
node_straptoc/
├── html_app.js              # Main server entry point
├── static/
│   ├── js/                  # Backend modules
│   │   ├── init.js          # Initialization and setup
│   │   ├── agenda.js        # Calendar and task management
│   │   ├── notes.js         # Note management
│   │   ├── util.js          # Utility functions
│   │   ├── modify_html.js   # HTML/Markdown sync
│   │   ├── folders.js       # File system management
│   │   ├── make_subtit.js   # Subtitle processing
│   │   └── ...
│   ├── config.yaml          # Central configuration
│   ├── agenda.yaml          # Agenda data
│   └── notes.json           # Notes data
├── lib/
│   └── straptoc.js          # Main client-side library (2,922 lines)
├── views/
│   ├── page_struct/
│   │   └── base.html        # Master page template
│   ├── basics/              # Core UI components
│   │   ├── agenda.html
│   │   ├── notes.html
│   │   ├── tchat.html
│   │   ├── manuscript.html
│   │   ├── voice.html
│   │   └── ...
│   └── plugins/             # Feature plugins
│       ├── video.html
│       ├── pdf.html
│       ├── djvu.html
│       └── ...
└── strap_database.db        # SQLite database
```

## Key Features Explained

### Straptoc.js - Extended Markdown
The core [lib/straptoc.js](lib/straptoc.js) library extends markdown with:
- Video and PDF embedding
- Interactive portfolios and carousels
- Folding lists
- Tooltips and text hiding
- Image sizing and captions
- Copy/paste list items

### Auto-save and Version Control
The application automatically saves your work every 15 minutes ([static/js/util.js](static/js/util.js)) and maintains version history with configurable limits.

### Agenda with Alerts
The agenda system ([static/js/agenda.js](static/js/agenda.js)) supports:
- YAML-based event storage
- Time-based alerts (e.g., "8h30 Meeting with team")
- Calendar visualization with full year display
- Current day highlighting

### Real-time Collaboration
Socket.io integration provides:
- Live chat between users
- Synchronized notes and agenda updates
- Real-time content changes

## Usage Examples

### Adding a Scheduled Event
In the agenda, add an entry in the format:
```
8h30 Team meeting
14h00 Project review
```

### Using Voice Commands
Enable voice commands and use the configured vocabulary to navigate and control the application hands-free.

### Embedding Media
Use the extended markdown syntax to embed:
- Videos: `[video:path/to/video.mp4]`
- PDFs: `[pdf:document.pdf]`
- Images with captions: `[img:photo.jpg|This is a caption]`

## Development

### Recent Updates
- Calendar display improvements with full year view
- Enhanced agenda functionality with time-based alerts
- Centralized configuration in config.yaml
- Database integration for user management
- Bug fixes and stability improvements

## Security

- HTTPS with SSL/TLS encryption
- SQLite with UNIQUE constraints on user emails
- File system sandboxing via express.static()
- XSS protection through Nunjucks autoescape

## License

This project is available under the terms specified in the repository.

## Repository

[https://github.com/strablabla/node_straptoc](https://github.com/strablabla/node_straptoc)

## Support

For issues, questions, or contributions, please visit the GitHub repository.

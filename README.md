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
- **Global Search**: Cross-page search functionality (Shift+F)
  - Searches across all pages in the application
  - Real-time results grouped by page
  - Click to navigate and auto-scroll to matched content
  - Temporary highlighting of found elements
- **Configuration Editor**: Visual interface for managing application settings (Ctrl+Shift+C)
  - Server settings (port, host, SSL certificates)
  - File paths and directory hierarchies
  - Color tags with visual color pickers
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

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/strablabla/node_straptoc.git
cd node_straptoc
```

2. Install dependencies:
```bash
npm install
```

3. **Create your configuration files** (copy from templates):
```bash
cd static/
cp config.yaml.example config.yaml
cp agenda.yaml.example agenda.yaml
cp notes.json.example notes.json
cp pages.json.example pages.json
cp drawing_state.json.example drawing_state.json
cd ..
```

4. **Edit your configuration**:
   - Open [static/config.yaml](static/config.yaml) and customize:
     - File paths and directories (addresses section)
     - Server port and host (server section)
     - Color tags
     - Voice command vocabulary
     - UI settings

5. **Generate SSL certificates** for HTTPS:
```bash
openssl genrsa -out key.pem 2048
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt
```

6. **Start the server**:
```bash
node html_app.js
```

7. **Access the application**:
   - Open your browser and navigate to `https://localhost:3001` (or your configured port)
   - Accept the self-signed certificate warning (for development)

> **Note**: Your personal configuration files (`config.yaml`, `agenda.yaml`, etc.) are ignored by git and won't be overwritten by `git pull`. See [SETUP.md](SETUP.md) for detailed setup instructions.

## Configuration

The application uses a centralized YAML configuration file: [static/config.yaml](static/config.yaml)

### Configuration Editor (New!)

Press **Ctrl+Shift+C** to open the visual Configuration Editor, which provides a user-friendly interface for managing all application settings without manually editing YAML files.

**Features:**
- **Server Tab**: Configure port, host, and SSL certificate paths
- **Paths Tab**: Manage file directories with hierarchical tree structure
  - Use ↳ to add child subdirectories
  - Use ↓ to add sibling directories
  - Use ✕ to remove directories
- **Color Tags Tab**: Customize category colors with visual color pickers
- **Real-time Updates**: Changes are immediately saved to config.yaml
- **Visual Notifications**: User-friendly feedback for all operations

### Main Configuration Sections:
- **server**: Server settings (port, host, SSL certificates)
- **addresses**: Static file paths and directories (hierarchical structure)
- **color_tags**: Category definitions for content organization
- **vocabulaire**: Hierarchical voice command vocabulary
- **subtitles_path**: Path to subtitle files
- **config**: UI styling and page properties

### Server Configuration Example:
```yaml
server:
  port: 3001           # HTTPS port (default: 3001)
  host: "0.0.0.0"      # Listen on all interfaces (use "127.0.0.1" for localhost only)
  ssl:
    key: "key.pem"     # SSL private key path
    cert: "server.crt" # SSL certificate path
```

### User-Specific Files (ignored by git):
- `config.yaml` - Main configuration (created from `config.yaml.example`)
- `agenda.yaml` - Calendar events and tasks
- `notes.json` - User notes
- `pages.json` - Available pages
- `drawing_state.json` - Canvas drawing state
- `latex_voc.json` - LaTeX voice commands
- `strap_database.db` - SQLite user database
- `*.pem`, `*.crt` - SSL certificates (never commit these!)

> **Important**: These files are protected by `.gitignore` and won't be overwritten by `git pull`. Template files (`.example`) are provided as references.

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
│   │   ├── config_editor.html  # Configuration editor (Ctrl+Shift+C)
│   │   ├── notifications.html  # Global notification system
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
├── lib/
│   ├── config.js            # Configuration management socket handlers
│   └── keymaster.js         # Keyboard shortcuts
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

### Global Search System
The search functionality ([views/basics/search.html](views/basics/search.html), [lib/config.js](lib/config.js)) provides:
- Server-side search across all markdown files
- List item matching with case-insensitive search
- Results grouped by page with match counts
- Auto-navigation and scroll-to-result functionality
- Temporary highlighting (2s) of matched elements
- Keyboard shortcut: Shift+F to open, Enter to search, Escape to close
- Voice command: "Rechercher"

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

### Searching Across Pages
Press **Shift+F** to open the Global Search:
- **Enter search term**: Type any word or phrase to search across all pages
- **Click Search or press Enter**: View results grouped by page
- **Click a result**: Navigate to the page and auto-scroll to the matched item
- **Yellow highlight**: Found items are temporarily highlighted for 2 seconds
- **Voice alternative**: Say "Rechercher" to open the search modal

### Managing Configuration
Press **Ctrl+Shift+C** to open the Configuration Editor:
- **Change server port**: Go to Server tab, modify the port field, click Save
- **Add a directory path**: Go to Paths tab, enter path, click Add Path
- **Create subdirectories**: Click ↳ next to a path to add a child, or ↓ to add a sibling
- **Customize colors**: Go to Color Tags tab, click color swatches to change category colors

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
- **Global Search System** across all pages (Shift+F)
  - Server-side search in markdown files with auto-scroll to results
  - Results grouped by page with temporary highlighting
  - Session storage for navigation state persistence
  - Voice command integration
- **Visual Configuration Editor** with three tabs (Server, Paths, Color Tags)
  - Real-time YAML editing with hierarchical path management
  - Custom notification system replacing native browser alerts
  - Context-aware confirm dialogs with dynamic positioning
  - Keyboard shortcuts (Ctrl+Shift+C to open, Enter to save)
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

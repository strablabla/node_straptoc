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
  - **Playlist panel** (helmet icon): builds a playable list of selected videos with shuffle, loop, prev/next, progress bar and seek
  - **Directory grouping**: clicking a directory name adds all its videos under an indented sub-list headed by the directory title
  - **Bounded height with scroll**: the playlist window is capped at twice its empty size; extra entries are reachable via a side scroll bar
  - **Selective delete mode** (✕ button): toggle on, then click any entry to remove it from the playlist; toggle off to resume playback; the bin icon still clears the whole list at once
- **PDF Viewer**: Built-in PDF document viewer
- **DJVU Reader**: View DJVU format documents
- **EPUB Reader**: Read e-books in EPUB format
- **Image Galleries**: Portfolio management with carousels and multiple visualization modes (cascade, circle, one-by-one navigation)
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
- **Pages Tab**: Manage page visibility, rename, and delete pages
  - Hide/Show pages from the left sidebar navigation
  - Rename pages (updates file names automatically)
  - Delete pages (with confirmation)
  - Hidden pages are stored in config.yaml (survives browser data clearing)
- **Real-time Updates**: Changes are immediately saved to config.yaml
- **Visual Notifications**: User-friendly feedback for all operations

### Main Configuration Sections:
- **server**: Server settings (port, host, SSL certificates)
- **addresses**: Static file paths and directories (hierarchical structure)
- **color_tags**: Category definitions for content organization
- **vocabulaire**: Hierarchical voice command vocabulary
- **subtitles_path**: Path to subtitle files
- **hidden_pages**: List of pages to hide from the left sidebar navigation
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

### Hidden Pages Configuration Example:
```yaml
hidden_pages:
  - example1          # Pages listed here won't appear in the left sidebar
  - example2          # but can still be accessed directly via URL
  - archived_notes    # Hidden pages can be toggled visible/hidden in the Config Editor
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
│   │   ├── folders.js       # File system management (!fold recursive folder scanning)
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
│       ├── extract_folder.html  # Unified !fold handler (recursive folder extraction)
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
- Folding lists (with deep fold mode via Alt+Q)
- `!fold` command for automatic folder content extraction (PDFs, EPUBs, DJVUs, images, videos) with recursive subfolder support
- Tooltips and text hiding
- Image sizing and captions
- Copy/paste list items

### Portfolio Photo Visualization Modes
When viewing photos from a portfolio ([views/plugins/photos.html](views/plugins/photos.html)), click on a thumbnail to open the photo. Each opened photo has a menu button (☰) in the top-left corner with multiple visualization options:

#### Layout Options
- **Cascade**: Arranges all open photos in a diagonal stack from top-left, with each photo offset by 100px (1/5 of standard size). Photos overlap like a deck of cards, useful for comparing multiple images.
- **Circle**: Positions all open photos in a circular arrangement around the center of the screen. Photos are evenly distributed around the circle, starting from the top position.
- **One by One**: Full-screen navigation mode for browsing through all portfolio photos sequentially:
  - Displays navigation arrows (◄ ►) on either side of the current photo
  - Semi-transparent overlay (50% opacity) hides the rest of the page for focused viewing
  - Preserves the current photo size when navigating between images
  - Click on the overlay background to exit the mode while keeping the current photo open
  - Double-click on the photo to close it and exit the mode

#### Size Options
- **Standard**: Resets the photo to the target maximum dimension (500px), maintaining aspect ratio. The largest dimension (width or height) will be scaled to 500px.
- **Zoom Slider**: Each photo has a zoom slider at the bottom allowing up to 4x zoom (from 0.5x to 4x). In one-by-one mode, the arrows automatically reposition when you release the slider.

#### Photo Interactions
- **Drag**: Photos can be dragged anywhere on the screen. In one-by-one mode, arrows follow the photo position.
- **Double-click**: Closes the photo (and exits one-by-one mode if active)
- **Close All**: Menu option to close all open photos at once

### Global Search System
The search functionality ([views/basics/search.html](views/basics/search.html), [lib/config.js](lib/config.js)) provides:
- Server-side search across all markdown files
- List item matching with case-insensitive search
- Results grouped by page with match counts
- Auto-navigation and scroll-to-result functionality
- Temporary highlighting (2s) of matched elements
- Keyboard shortcut: Ctrl+Shift+F to open, Enter to search, Escape to close
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
- **Manage pages**: Go to Pages tab to:
  - Hide/Show pages from the left sidebar (click Hide/Show button)
  - Rename pages (click Rename, enter new name)
  - Delete pages (click Delete, confirm action)

### Adding a Scheduled Event
In the agenda, add an entry in the format:
```
8h30 Team meeting
14h00 Project review
```

### Setting Up Calendar Reminders

#### Installation
The reminder system requires the `nodemailer` package:
```bash
npm install nodemailer
```

#### Configuration
1. Press **Ctrl+Shift+C** to open the Configuration Editor
2. Navigate to the **Reminders** tab
3. Configure post-it notifications:
   - **Notification Minutes Before**: How many minutes before an event to show notifications (default: 30)
   - **Check Interval Minutes**: How often the server checks for upcoming events (default: 5)
4. (Optional) Configure email notifications:
   - **Enable Email Notifications**: Toggle on to activate email alerts
   - **Email Address**: Where to send reminder emails
   - **Email Service**: Select Gmail, Outlook, Yahoo, or Custom SMTP
   - **Email User**: Your email account username
   - **Email Password**: Your email account password (use app password for Gmail/Outlook)
5. Click **Save Reminders Settings**

#### Gmail App Password Setup
For Gmail accounts, you need to create an app password:
1. Enable 2-factor authentication on your Google account
2. Visit [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Create a new app password for "Mail"
4. Copy the 16-character password and use it in the Email Password field

#### Usage Examples

**Time-based alert (will send email if enabled):**
```
14:30 Important client meeting
```
- Displays in pink post-it with clock icon
- Sends email notification (if configured)
- Shows 30 minutes before event (configurable)

**All-day event:**
```
Team building day
Conference in Paris
```
- Displays in yellow post-it with calendar icon
- Shows at 9 AM on the event day
- Auto-dismisses after 5 minutes

**How the system works:**
- Server checks for upcoming events every 5 minutes (configurable)
- Post-it notifications appear at the top center of the page
- Notifications are broadcast to all connected clients
- Email sent separately for each upcoming event (if enabled)
- Alert events (with time HH:MM format) get special pink styling
- Regular events auto-dismiss after 5 minutes, alerts require manual close

#### Troubleshooting

**Email not sending:**
- Verify email credentials are correct
- For Gmail/Outlook: Ensure you're using an app password, not your regular password
- Check that "Email Enabled" is toggled on
- Check server console for error messages (Ctrl+Shift+D to open Debug Editor)

**Notifications not appearing:**
- Verify events are properly formatted in the agenda
- Check the "Check Interval" isn't set too high
- Ensure "Notification Minutes Before" gives enough window for detection
- Open browser console (F12) and check for [Reminders] log messages

### Using Voice Commands
Enable voice commands and use the configured vocabulary to navigate and control the application hands-free.

### Embedding Media
Use the extended markdown syntax to embed:
- Videos: `[video:path/to/video.mp4]`
- PDFs: `[pdf:document.pdf]`
- Images with captions: `[img:photo.jpg|This is a caption]`

## Development

### Recent Updates

#### Configuration & Settings
- **Visual Configuration Editor** (Ctrl+Shift+C) with four tabs:
  - **Server Tab**: Configure port, host, and SSL certificate paths
  - **Paths Tab**: Hierarchical directory management
  - **Color Tags Tab**: Visual color picker for category customization
  - **Pages Tab**: Complete page management interface
    - Hide/Show pages from left sidebar navigation
    - Rename pages with automatic file synchronization
    - Delete pages with confirmation dialogs
    - **Saved Pages Directory Configuration**: Configure where old page versions are stored
      - Enter absolute path with automatic relative path calculation
      - Display folder name with absolute path tooltip on hover
      - Double-click to edit the directory path
      - Auto-sizing display that adapts to folder name width
    - **Autosave Interval Configuration**: Configurable autosave frequency
      - HTML5 number input with native spinner controls
      - Set interval in minutes (1-1440)
      - Real-time updates to autosave system
      - Elapsed-time tracking instead of fixed time windows
    - Hidden pages stored in config.yaml (persistent across browser sessions)
    - Real-time updates across all connected clients
  - Real-time YAML editing
  - Custom notification system replacing native browser alerts
  - Context-aware confirm dialogs with dynamic positioning
  - Keyboard shortcuts (Ctrl+Shift+C to open, Enter to save)

#### Data Management & Architecture
- **Socket.io Data Transmission**: Migrated from static global.js file generation to real-time socket.io communication
  - Pages data (dchandir, list_pages, list_md, dic_text_id) sent via socket on page load
  - Eliminates need for file system writes on every page change
  - Improved reliability and real-time synchronization
  - Global socket reference (window.socket) accessible across all modules
- **Centralized Configuration**: All settings now in config.yaml including addr_saved (saved pages directory)

#### Developer Tools
- **Debug Editor** (Ctrl+Shift+D): Real-time server console output viewer
  - Live streaming of server logs (console.log, console.warn, console.error)
  - Color-coded log levels ([LOG], [WARN], [ERROR], [INFO])
  - Auto-scroll to latest logs
  - Clear console button
  - Intercepts Node.js console methods and broadcasts via socket.io
  - Essential for debugging server-side issues without SSH access

#### System Controls
- **Shutdown Button**: Graceful server shutdown from the web interface
  - Fixed position button in top-right corner (right: 10px)
  - Confirmation modal to prevent accidental shutdowns
  - Broadcasts shutdown notification to all connected clients
  - Automatic window close or redirect to about:blank after shutdown
  - Socket connection verification before sending shutdown command

#### Search & Navigation
- **Global Search System** across all pages (Shift+F)
  - Server-side search in markdown files with auto-scroll to results
  - Results grouped by page with temporary highlighting
  - Session storage for navigation state persistence
  - Voice command integration ("Rechercher")

#### UI Improvements
- **Page Icon Management System**: Visual icon picker for pages
  - Click on page icon (top-right) to open icon selector modal
  - 375 SVG icons available in responsive grid layout
  - Icons stored in config.yaml (dic_icon_pages)
  - Default icon 335 for pages without assigned icon
  - Real-time synchronization across all connected clients
  - Hover effects and visual feedback on selection
  - Persistent icon assignments across sessions
- **Lock Button** repositioned (right: 70px) with tooltip
- **Shutdown Button** positioned at top: 3px, right: 20px
- Calendar display improvements with full year view
- Enhanced agenda functionality with time-based alerts
- Bug fixes and stability improvements

#### Calendar Reminder System
- **Post-it Notifications**: Visual sticky note reminders at the top of the page
  - Configurable notification timing (minutes before events)
  - Automatic display for all calendar events
  - Time-based alerts shown with clock icon (⏰)
  - All-day events shown with calendar icon (📅)
  - Alert events displayed in pink gradient, regular events in yellow
  - Manual dismiss with close button (×)
  - Auto-dismiss after 5 minutes for non-alert events
  - Animated slide-down entrance
  - Deduplication to prevent duplicate notifications
- **Email Notifications** (Optional):
  - Support for Gmail, Outlook, Yahoo, and custom SMTP servers
  - App password authentication (required for Gmail/Outlook)
  - Configurable recipient address
  - Automatic email sending for upcoming events
  - Separate email sent for each event
- **Configuration** (via Ctrl+Shift+C → Reminders tab):
  - Notification timing: Minutes before event to show notification (default: 30)
  - Check interval: How often to check for upcoming events (default: 5 minutes)
  - Email toggle: Enable/disable email notifications
  - Email service selection: Gmail, Outlook, Yahoo, or Custom SMTP
  - Email credentials: User/password with app password instructions
  - Real-time configuration updates without server restart

### Folder Content Extraction (`!fold`)

The `!fold` command automatically extracts and displays the content of a folder. It supports PDFs, EPUBs, DJVUs, images (PNG, JPG, WEBP), and videos (MP4, WEBM, OGG, MKV, AVI).

#### Usage

In your markdown, write a list item with `!fold` followed by a folder path:

```markdown
* !fold sdata/docs/langues/mandarin/Livres
```

#### Behavior

- **Files** directly in the folder are displayed with their appropriate viewers (embed for PDFs, lazy-load for EPUBs/DJVUs, gallery for images, player for videos)
- **Subfolders** appear as expandable items with `[+]`/`[-]` toggles
- **Recursive**: clicking `[+]` on a subfolder lazily loads its content, which can itself contain files and further subfolders — works at any depth
- All content is **lazy-loaded**: files and subfolders are only fetched from the server when the user expands them

#### Examples

```markdown
##### PDFs from a folder
* !fold pdfs

##### Books with nested subfolders (e.g. by author, by topic)
* !fold sdata/docs/langues/mandarin/Livres

##### Mixed content (PDFs + EPUBs) in nested folders
* !fold many_txt_types
```

> **Note**: The old `!fold path !inside` syntax is still accepted for backward compatibility, but `!inside` is no longer needed — `!fold` alone handles subfolders recursively.

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

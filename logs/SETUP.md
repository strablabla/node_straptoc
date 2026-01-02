# Setup Guide - Node Straptoc

This guide helps you set up Node Straptoc so your personal configuration won't be overwritten by `git pull`.

## Problem

Previously, user-specific files like `config.yaml`, `agenda.yaml`, and SSL certificates were tracked by git. This meant:
- Running `git pull` could overwrite your personal settings
- Your private data (agenda, notes) could accidentally be committed
- SSL private keys could be exposed (security risk)

## Solution

User-specific files are now **ignored by git** and template files (`.example`) are provided instead.

## First-Time Setup

### 1. Create Your Configuration Files

Copy the example templates to create your personal configuration files:

```bash
# Navigate to the static directory
cd static/

# Copy configuration templates
cp config.yaml.example config.yaml
cp agenda.yaml.example agenda.yaml
cp notes.json.example notes.json
cp pages.json.example pages.json
cp drawing_state.json.example drawing_state.json
```

### 2. Edit Your Configuration

Edit `static/config.yaml` to set your own paths:

```bash
nano static/config.yaml  # or use your preferred editor
```

**Important sections to customize:**

- **addresses**: Update with your actual file paths
  ```yaml
  addresses:
    - "/your/actual/path/to/downloads"
    - "/your/actual/path/to/media"
  ```

- **subtitles_path**: Set your subtitle folder path
  ```yaml
  subtitles_path: "/your/path/to/subtitles"
  ```

- **server**: Configure server port and host (optional, defaults work fine)
  ```yaml
  server:
    port: 3001           # Change if 3001 is already in use
    host: "0.0.0.0"      # Use "127.0.0.1" for localhost only
    ssl:
      key: "key.pem"     # Path to SSL private key
      cert: "server.crt" # Path to SSL certificate
  ```

- **color_tags**, **vocabulaire**, **config**: Customize as needed

### 3. Generate SSL Certificates

The application requires HTTPS with SSL certificates. Generate self-signed certificates:

```bash
# From the project root directory
cd /home/meglio/Bureau/git/node_straptoc/

# Generate private key
openssl genrsa -out key.pem 2048

# Generate certificate signing request
openssl req -new -key key.pem -out csr.pem

# Generate self-signed certificate (valid for 365 days)
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt
```

**Security Note**: These files (`*.pem`, `*.crt`) are now ignored by git and will never be committed.

### 4. Initialize Database (Automatic)

The SQLite database is created automatically when you first run the application. It's located at:
- `static/js/strap_database.db`

This file is ignored by git and contains your user data.

## What's Protected from Git

These files are now in [.gitignore](.gitignore) and **will not be tracked** or overwritten by git:

### Configuration Files
- `static/config.yaml` - Main configuration
- `static/agenda.yaml` - Your personal agenda
- `static/notes.json` - Your notes
- `static/pages.json` - Your page list
- `static/drawing_state.json` - Drawing preferences
- `static/latex_voc.json` - LaTeX vocabulary
- `static/addr_saved.json` - Saved addresses

### Security-Sensitive Files
- `*.pem` - Private keys
- `*.crt` - Certificates
- `*.key` - Key files
- `*.db` - Database files

### User Content
- `views/saved/` - Saved views and content

## Updating the Application

When you run `git pull` to get updates:

✅ **Safe** - Your personal files are preserved:
- Your `config.yaml` settings remain unchanged
- Your `agenda.yaml` events are kept
- Your notes, pages, and database are untouched
- Your SSL certificates stay in place

✅ **Updated** - Only application code and templates:
- Application code in `html_app.js`, `static/js/`, etc.
- Template files (`*.example`)
- Documentation and README

### After Pulling Updates

1. **Check for new template features**:
   ```bash
   # Compare your config with the new template
   diff static/config.yaml static/config.yaml.example
   ```

2. **Merge new features manually** if desired:
   - Review what's new in `.example` files
   - Add new sections to your personal config files as needed

## Template Files

Template files (`.example`) are tracked by git and provide:
- Default configurations for new users
- Reference for available options
- Documentation of the expected format

### Available Templates

- [static/config.yaml.example](static/config.yaml.example) - Main configuration template
- [static/agenda.yaml.example](static/agenda.yaml.example) - Agenda format example
- [static/notes.json.example](static/notes.json.example) - Notes format example
- [static/pages.json.example](static/pages.json.example) - Pages list example
- [static/drawing_state.json.example](static/drawing_state.json.example) - Drawing state example

## Migration from Old Setup

If you already have existing configuration files tracked by git:

### Option 1: Keep Your Current Settings

```bash
# Your files are already created, just ensure they're in the correct format
# The next git pull won't overwrite them since they're now in .gitignore

# To stop git from tracking these files (if they were previously tracked):
git rm --cached static/config.yaml
git rm --cached static/agenda.yaml
git rm --cached static/notes.json
git rm --cached static/pages.json
git rm --cached static/drawing_state.json
git rm --cached key.pem server.crt csr.pem
git rm --cached static/js/strap_database.db

# Commit the removal from git (the files stay on your disk)
git commit -m "Remove user-specific files from git tracking"
```

### Option 2: Fresh Start

```bash
# Backup your current settings
cp static/config.yaml static/config.yaml.backup
cp static/agenda.yaml static/agenda.yaml.backup

# Pull the latest changes
git pull

# Restore or merge your settings
cp static/config.yaml.backup static/config.yaml
# Or manually merge with the new template:
# diff static/config.yaml.backup static/config.yaml.example
```

## Troubleshooting

### "File not found" errors on startup

**Cause**: Missing configuration files

**Solution**: Copy the templates as shown in step 1

```bash
cd static/
cp config.yaml.example config.yaml
# Copy other templates as needed
```

### SSL certificate errors

**Cause**: Missing or invalid SSL certificates

**Solution**: Generate new certificates (see step 3)

### Git wants to overwrite my files

**Cause**: Files were tracked before the .gitignore update

**Solution**: Remove them from git tracking (see Migration section)

## Best Practices

1. **Never commit personal data**: Keep your actual `config.yaml`, `agenda.yaml`, etc. out of git
2. **Backup regularly**: Your personal files are not in git, so back them up separately
3. **Review template updates**: After `git pull`, check if `.example` files have new features
4. **Keep templates updated**: If you improve the templates, contribute them back to the project
5. **Customize server settings**: Change the port in `config.yaml` if 3001 conflicts with other applications
6. **Use localhost for private access**: Set `host: "127.0.0.1"` if you don't want the server accessible from other machines

## Contributing Configuration Improvements

If you want to contribute improvements to the default configuration:

1. Edit the `.example` template files (these ARE tracked by git)
2. Commit and push the template changes
3. Your personal files remain private and unchanged

## Security Notes

⚠️ **Critical**: Never commit these files:
- Private keys (`*.pem`, `*.key`)
- SSL certificates for production use
- Database files with user data
- Personal agendas or notes

The updated `.gitignore` prevents this, but always double-check before committing:

```bash
# Check what will be committed
git status

# Should NOT see any *.pem, *.crt, *.db, or personal config files
```

## Questions?

If you encounter issues or have questions about the setup, please open an issue on the GitHub repository.

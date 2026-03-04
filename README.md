# gyork-wbot

A Windows automation library for Node.js that provides:

- Window manipulation
- Mouse and keyboard control
- Screen capture and OCR
- Excel automation
- Speech recognition and synthesis
- Digital human avatars

## Installation

```bash
npm install gyork-wbot
```

After installation, the package will automatically check and download required dependencies (FFmpeg, OpenCV) if they are missing.

### Manual Dependency Installation

If automatic download fails, you can manually install dependencies:

```bash
# Check dependency status
npx gyork-wbot-check

# Install missing dependencies
npx gyork-wbot-install
```

### Using Mirror Sources

For users in China or behind slow connections, you can configure mirror sources:

```bash
# Set Gitee mirror (recommended for users in China)
set GYORK_WBOT_GITEE_MIRROR=https://gitee.com/your-repo/releases/download/v1.0.0

# Or set a custom mirror
set GYORK_WBOT_MIRROR=https://your-custom-mirror.com

# Then install dependencies
npx gyork-wbot-install
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `GYORK_WBOT_MIRROR` | Custom mirror URL (highest priority) |
| `GYORK_WBOT_GITHUB_MIRROR` | GitHub mirror URL |
| `GYORK_WBOT_GITEE_MIRROR` | Gitee mirror URL |

## Usage

```javascript
const WindowsBot = require('gyork-wbot');

// Create instance
const bot = await WindowsBot.create('127.0.0.1', 19999);

// Example: Find window
const hwnd = await bot.findWindow('Notepad', 'Untitled - Notepad');
```

## Dependencies

### Core Dependencies (included in package)

- `WindowsDriver.exe` - Main automation driver
- `WindowsTool.exe` - Utility tools
- `WindowsAccessBridge-64.dll` - Java accessibility bridge

### Downloadable Dependencies (~150MB)

These dependencies are automatically downloaded during postinstall:

- **FFmpeg DLLs** - Video/audio processing
  - `avcodec-61.dll`
  - `avfilter-10.dll`
  - `avformat-61.dll`
  - `avutil-59.dll`
  - `swscale-8.dll`
  - `swresample-5.dll`
  - `postproc-58.dll`
- **OpenCV** - Image processing
  - `opencv_world470.dll`

## Troubleshooting

### Download Failed

If automatic download fails:

1. Check your network connection
2. Try using a mirror source (see above)
3. Download manually from:
   - GitHub: `https://github.com/gyorkluu/gyork-wbot-deps/releases`
   - Gitee: `https://gitee.com/gyorkluu/gyork-wbot-deps/releases`
4. Extract files to the package directory:
   ```
   node_modules/gyork-wbot/
   ```

### Package Too Large Error

If you see "package too large" error when publishing, ensure you're using the latest `.npmignore` that excludes large DLL files.

## Documentation

See `doc.md` for full API documentation.

## License

MIT
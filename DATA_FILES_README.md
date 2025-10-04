# Demo Data Files Location

## Overview

AuditVerse demo data must be maintained in **two locations** due to different usage contexts:

1. **`src/data/comprehensiveSampleData.json`** - Used by dev server (`npm run dev`)
2. **`public/data/comprehensiveSampleData.json`** - Copied to dist during build (`npm run build`)

## Why Two Locations?

### Dev Server (src/data/)
- Vite dev server serves files from `src/` directory
- Welcome screen loads demo data from `/data/comprehensiveSampleData.json`
- This resolves to `src/data/comprehensiveSampleData.json` in dev mode

### Production Build (public/data/)
- Build process copies from `public/data/` to `dist/data/`
- Production app loads from `dist/data/comprehensiveSampleData.json`
- This ensures demo data is available in built application

## Important: Keep Both In Sync!

When updating demo data:

1. ✅ Update both `src/data/` and `public/data/` files
2. ✅ Ensure both have identical content
3. ✅ Test in both dev and production builds

## Quick Sync Command

```bash
# Copy from public/ to src/
cp public/data/comprehensiveSampleData.json src/data/comprehensiveSampleData.json

# Or copy from src/ to public/
cp src/data/comprehensiveSampleData.json public/data/comprehensiveSampleData.json
```

## Verification

```bash
# Verify both files have new format
python3 -c "
import json
src = json.load(open('src/data/comprehensiveSampleData.json'))
pub = json.load(open('public/data/comprehensiveSampleData.json'))
print('src has timeline:', 'timeline' in src)
print('public has timeline:', 'timeline' in pub)
print('Files match:', src == pub)
"
```

## Demo Data Format

Both files must follow the new event-based format:

```json
{
  "current": { /* current state */ },
  "timeline": {
    "events": [ /* historical events */ ],
    "snapshots": [ /* quarterly snapshots */ ]
  },
  "metadata": { /* optional metadata */ }
}
```

See [docs/data-format-specification.md](docs/data-format-specification.md) for complete spec.

## Backups

Backups are automatically created when converting:
- `src/data/comprehensiveSampleData.json.backup`
- `public/data/comprehensiveSampleData.json.backup`

## Related Files

- `scripts/convert-demo-data.py` - Conversion script
- `vite.config.js` - Build configuration (line 57)
- `docs/demo-data-guide.md` - Demo data documentation

## Troubleshooting

### Error: "Data must have a 'current' object"

**Cause**: Demo data file is in old format

**Fix**:
```bash
# Re-run conversion script
python3 scripts/convert-demo-data.py

# Then sync both locations
cp public/data/comprehensiveSampleData.json src/data/
```

### Dev server shows old data

**Cause**: `src/data/` file not updated

**Fix**:
```bash
cp public/data/comprehensiveSampleData.json src/data/
```

### Build missing demo data

**Cause**: `public/data/` file not updated or build config incorrect

**Fix**:
1. Verify file exists: `ls public/data/comprehensiveSampleData.json`
2. Check build config: `vite.config.js` line 57
3. Rebuild: `npm run build`
4. Verify: `ls dist/data/`

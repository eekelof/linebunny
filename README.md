# linebunny

Count lines of code in projects

## Usage
```bash
bunx linebunny <directory> [-t file_type] [-l low_threshold] [-h high_threshold] [-s] [-i directory_to_ignore]
```

Count TypeScript files in src directory:
```bash
bunx linebunny src -t ts
```

Count JavaScript files in current directory:
```bash
bunx linebunny . -t js -t jsx
```

Count multiple file types:
```bash
bunx linebunny src -t js -t ts -t jsx -t tsx -t vue
```

Check with manual thresholds:
```bash
bunx linebunny . -t js -l 80 -h 150
```

Check specific framework files sorted by line count:
```bash
bunx linebunny components -t vue -t svelte -l 120 -h 250 -s
```

Ignore common directories when scanning:
```bash
bunx linebunny . -t js -t ts -i node_modules -i .venv -i dist
```


### Required Arguments

- `<directory>` - Directory to search in (can be relative or absolute path)

### Optional Arguments

- `-t, --type` - File extension to include (can be used multiple times)
- `-l, --low` - Low threshold for green/yellow boundary (default: 100)
- `-h, --high` - High threshold for yellow/red boundary (default: 300)
- `-s, --sort` - Sort files by line count in ascending order
- `-i, --ignore` - Directory name to ignore (can be used multiple times)
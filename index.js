#!/usr/bin/env bun
import chalk from 'chalk';
import { readdirSync, readFileSync, statSync } from 'fs';
import { extname, join } from 'path';

// Default values
let targetDir = '';
let fileTypes = [];
let lowThreshold = 100;
let highThreshold = 300;

// Function to show usage
function showUsage() {
    console.log(chalk.yellow('Usage:'));
    console.log(chalk.white('  bun run index.js <directory> [-t type] [-l low_threshold] [-h high_threshold]'));
    console.log('');
    console.log(chalk.yellow('Options:'));
    console.log(chalk.white('  <directory>           Directory to search in'));
    console.log(chalk.white('  -t, --type            File extension to include (can be used multiple times)'));
    console.log(chalk.white('  -l, --low             Low threshold for green/yellow boundary ') + chalk.gray('(default: 100)'));
    console.log(chalk.white('  -h, --high            High threshold for yellow/red boundary ') + chalk.gray('(default: 300)'));
    console.log('');
    console.log(chalk.yellow('Examples:'));
    console.log(chalk.white('  bun run index.js src/ts -t ts -t tsx'));
    console.log(chalk.white('  bun run index.js . -t js -t jsx -l 50 -h 200'));
    process.exit(1);
}

// Parse command line arguments
function parseArguments() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        showUsage();
    }

    // First argument is the directory
    targetDir = args[0];

    // Parse options
    for (let i = 1; i < args.length; i++) {
        switch (args[i]) {
            case '-t':
            case '--type':
                if (i + 1 < args.length) {
                    fileTypes.push(args[i + 1]);
                    i++;
                } else {
                    console.error('Error: -t requires a file extension');
                    showUsage();
                }
                break;
            case '-l':
            case '--low':
                if (i + 1 < args.length) {
                    lowThreshold = parseInt(args[i + 1]);
                    i++;
                } else {
                    console.error('Error: -l requires a number');
                    showUsage();
                }
                break;
            case '-h':
            case '--high':
                if (i + 1 < args.length) {
                    highThreshold = parseInt(args[i + 1]);
                    i++;
                } else {
                    console.error('Error: -h requires a number');
                    showUsage();
                }
                break;
            default:
                console.error(`Unknown option: ${args[i]}`);
                showUsage();
        }
    }

    // Validate inputs
    if (!targetDir) {
        console.error('Error: Directory is required');
        showUsage();
    }

    try {
        const stat = statSync(targetDir);
        if (!stat.isDirectory()) {
            console.error(`Error: '${targetDir}' is not a directory`);
            process.exit(1);
        }
    } catch (err) {
        console.error(`Error: Directory '${targetDir}' does not exist`);
        process.exit(1);
    }

    if (fileTypes.length === 0) {
        console.error('Error: At least one file type is required');
        showUsage();
    }
}

// Recursively find files with specified extensions
function findFiles(dir, extensions) {
    const files = [];

    function scan(currentDir) {
        try {
            const entries = readdirSync(currentDir);

            for (const entry of entries) {
                const fullPath = join(currentDir, entry);

                try {
                    const stat = statSync(fullPath);

                    if (stat.isDirectory()) {
                        scan(fullPath);
                    } else if (stat.isFile()) {
                        const ext = extname(entry).slice(1); // Remove the dot
                        if (extensions.includes(ext)) {
                            files.push(fullPath);
                        }
                    }
                } catch (err) {
                    // Skip files/directories we can't access
                    continue;
                }
            }
        } catch (err) {
            // Skip directories we can't read
            return;
        }
    }

    scan(dir);
    return files;
}

// Count lines in a file
function countLines(filePath) {
    try {
        const content = readFileSync(filePath, 'utf8');
        return content.split('\n').length;
    } catch (err) {
        return 0;
    }
}

// Main function
function main() {
    parseArguments();

    const files = findFiles(targetDir, fileTypes);

    if (files.length === 0) {
        console.log('No files found with the specified extensions');
        return;
    }

    const results = [];
    let totalLines = 0;
    let greenCount = 0;
    let yellowCount = 0;
    let redCount = 0;

    // Process each file
    for (const file of files) {
        const lineCount = countLines(file);
        totalLines += lineCount;

        let color;
        if (lineCount < lowThreshold) {
            color = chalk.green;
            greenCount++;
        } else if (lineCount < highThreshold) {
            color = chalk.yellow;
            yellowCount++;
        } else {
            color = chalk.red;
            redCount++;
        }

        results.push({
            file,
            lines: lineCount,
            color
        });
    }

    // Sort results by line count (ascending)
    results.sort((a, b) => a.lines - b.lines);

    // Print results
    for (const result of results) {
        console.log(result.color(`${result.lines.toString().padStart(6)} ${result.file}`));
    }

    // Print total
    console.log(chalk.white(`${totalLines.toString().padStart(6)} total`));

    // Print summary
    const totalFiles = files.length;
    const greenPct = (greenCount / totalFiles) * 100;
    const yellowPct = (yellowCount / totalFiles) * 100;
    const redPct = (redCount / totalFiles) * 100;
    const avgLines = totalLines / totalFiles;

    console.log('');
    console.log(chalk.white('SUMMARY:'));
    console.log(chalk.green(`${greenCount} files (${greenPct.toFixed(1)}%) < ${lowThreshold} lines`));
    console.log(chalk.yellow(`${yellowCount} files (${yellowPct.toFixed(1)}%) ${lowThreshold}-${highThreshold - 1} lines`));
    console.log(chalk.red(`${redCount} files (${redPct.toFixed(1)}%) >= ${highThreshold} lines`));
    console.log(chalk.white(`Total: ${totalFiles} files (${totalLines} lines, ${avgLines.toFixed(1)} avg)`));
}

// Run the program
main();


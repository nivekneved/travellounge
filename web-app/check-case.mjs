import fs from 'fs';
import path from 'path';

function checkDirectory(dir) {
    let hasError = false;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (checkDirectory(fullPath)) hasError = true;
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                const importMatch = line.match(/import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/);
                if (importMatch) {
                    let importPath = importMatch[1];
                    if (importPath.startsWith('.')) {
                        // resolve the path
                        const resolvedPathBase = path.resolve(dir, importPath);
                        let targetPath = resolvedPathBase;

                        // try to see what file actually matches
                        let found = false;
                        let exactMatch = false;
                        let targetDir = path.dirname(resolvedPathBase);
                        let targetFile = path.basename(resolvedPathBase);

                        try {
                            if (fs.existsSync(targetDir)) {
                                const dirFiles = fs.readdirSync(targetDir);
                                for (const df of dirFiles) {
                                    // Check if basename matches exactly, or matches with extension added
                                    if (df === targetFile || df === targetFile + '.js' || df === targetFile + '.jsx') {
                                        found = true;
                                        exactMatch = true;
                                        break;
                                    }
                                    if (df.toLowerCase() === targetFile.toLowerCase() || df.toLowerCase() === (targetFile + '.js').toLowerCase() || df.toLowerCase() === (targetFile + '.jsx').toLowerCase()) {
                                        found = true;
                                        console.log(`CASE MISMATCH in ${fullPath}:${index + 1}\n  Imported: ${targetFile}\n  Actual file: ${df}\n`);
                                        hasError = true;
                                        break;
                                    }
                                }
                            }
                        } catch (e) { }
                    }
                }
            });
        }
    }
    return hasError;
}

const dir = path.join(process.cwd(), 'src');
console.log('Checking for case mismatched imports...');
if (!checkDirectory(dir)) {
    console.log('No case mismatches found.');
}

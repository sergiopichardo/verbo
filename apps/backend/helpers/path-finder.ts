import path from 'path';
import fs from 'fs';

export class PathFinder {
    private excludedPaths: string[];

    constructor(private projectRootName: string, excludedPaths: string[] = []) {
        this.excludedPaths = excludedPaths.map(p => path.normalize(p));
    }

    public find(startDir: string, targetPath: string): string | null {
        const projectRoot = this.locateProjectRoot(startDir);

        if (!projectRoot) {
            console.log(`Project root '${this.projectRootName}' not found.`);
            return null;
        }
        return this.searchFromRoot(projectRoot, targetPath);
    }

    private locateProjectRoot(startDir: string): string | null {
        let currentDir = path.resolve(startDir);
        while (true) {
            if (path.basename(currentDir) === this.projectRootName) {
                return currentDir;
            }

            const parentDir = path.dirname(currentDir);
            if (parentDir === currentDir) {
                // Reached filesystem root without finding project root
                return null;
            }

            currentDir = parentDir;
        }
    }

    private searchFromRoot(rootDir: string, targetPath: string): string | null {
        const fullPath = path.join(rootDir, targetPath);

        if (this.itemExists(fullPath)) {
            return fullPath;
        }

        const subdirectories = this.getSubdirectories(rootDir);
        for (const subdir of subdirectories) {
            const subdirPath = path.join(rootDir, subdir);
            if (this.isExcluded(subdirPath)) {
                continue;
            }
            const result = this.searchFromRoot(subdirPath, targetPath);
            if (result) {
                return result;
            }
        }
        return null;
    }

    private itemExists(itemPath: string): boolean {
        try {
            return fs.existsSync(itemPath);
        } catch (error) {
            return false;
        }
    }

    private getSubdirectories(dir: string): string[] {
        return fs.readdirSync(dir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
    }

    private isExcluded(dirPath: string): boolean {
        return this.excludedPaths.some(excludedPath => {
            return dirPath.startsWith(excludedPath) || path.relative(excludedPath, dirPath) === '';
        })
    }
}

export function findPath(targetPath: string, excludedPaths: string[] = []): string | null {
    const finder = new PathFinder('verbo', excludedPaths); // Adjust 'verbo' to match your project root name
    const startDir = process.cwd();
    const result = finder.find(startDir, targetPath);

    if (!result) {
        console.log(`Item not found: ${targetPath}`);
    }

    return result;
}
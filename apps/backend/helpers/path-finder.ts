import path from 'path';
import fs from 'fs';

export class PathFinder {
    private normalizedExcludedPaths: string[];

    constructor(private projectRootName: string, excludedPaths: string[] = []) {
        this.normalizedExcludedPaths = excludedPaths.map(p => path.normalize(p));
    }

    public findTargetPath(startDir: string, targetPath: string): string | null {
        const projectRoot = this.findProjectRoot(startDir);
        if (!projectRoot) {
            console.log(`Project root '${this.projectRootName}' not found.`);
            return null;
        }
        return this.searchRecursively(projectRoot, targetPath);
    }

    private findProjectRoot(startDir: string): string | null {
        let currentDir = path.resolve(startDir);
        while (currentDir !== path.dirname(currentDir)) {
            if (path.basename(currentDir) === this.projectRootName) {
                return currentDir;
            }
            currentDir = path.dirname(currentDir);
        }
        return null;
    }

    private searchRecursively(rootDir: string, targetPath: string): string | null {
        const fullPath = path.join(rootDir, targetPath);
        if (this.pathExists(fullPath)) {
            return fullPath;
        }

        const subdirectories = this.getValidSubdirectories(rootDir);
        for (const subdir of subdirectories) {
            const result = this.searchRecursively(path.join(rootDir, subdir), targetPath);
            if (result) return result;
        }
        return null;
    }

    private pathExists(itemPath: string): boolean {
        return fs.existsSync(itemPath);
    }

    private getValidSubdirectories(dir: string): string[] {
        return fs.readdirSync(dir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            .filter(subdir => !this.isExcludedPath(path.join(dir, subdir)));
    }

    private isExcludedPath(dirPath: string): boolean {
        return this.normalizedExcludedPaths.some(excludedPath =>
            dirPath.startsWith(excludedPath) || path.relative(excludedPath, dirPath) === ''
        );
    }
}

export function findPath(targetPath: string): string {
    const defaultExcludedPaths = ['node_modules', 'build', 'cdk.out', '.git', '.next'];
    const pathFinder = new PathFinder('verbo', defaultExcludedPaths);
    const result = pathFinder.findTargetPath(process.cwd(), targetPath);

    if (!result) {
        throw new Error(`Item not found: ${targetPath}`);
    }

    return result;
}


// 1. The PathFinder class is initialized with a project root name and a list of excluded paths.
// 2. The findTargetPath method - is the main entry point, which first finds the project root and then searches for the target path.
// 3. findProjectRoot method - traverses up the directory tree to find the project root folder.
// 4. searchRecursively method - performs a depth-first search through the directory structure, avoiding excluded paths.
// 5. Helper methods like pathExists, getValidSubdirectories, and isExcludedPath are used to support the main search functionality.
// 6. The findPath function provides a simple interface to use the PathFinder class, with default excluded paths.


// Example usage
// Happy Path
// console.log('--------------------------------');
// console.log(findPath('lambda-layers/utils/src/api-gateway-response.ts'));
// console.log('--------------------------------');
// console.log(findPath('frontend/dist'));
// console.log('--------------------------------');
// console.log(findPath('cloudfront-functions/redirect-to-index-html.js'))
// console.log('--------------------------------');

// // Unhappy Path
// console.log('--------------------------------');
// console.log(findPath('frontend/notexists.ts'));
// console.log('--------------------------------');
// console.log(findPath('frontend/waddup'));
// console.log('--------------------------------');

import { PathFinder } from './path-finder';

export function findPath(targetPath: string): string {
    const excludedPaths = [
        'node_modules',
        'build',
        'cdk.out',
        '.git',
        '.next'
    ];

    try {
        const finder = new PathFinder('verbo', excludedPaths); // Adjust 'verbo' to match your project root name
        const startDir = process.cwd();
        const result = finder.find(startDir, targetPath);

        if (!result) {
            console.log(`Item not found: ${targetPath}`);
        }

        return result as string;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Error while finding path: ${error.message}`);
        }
        throw error;
    }
}


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

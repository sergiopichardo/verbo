import path from 'path';
import { findPath } from './helpers/path-finder'
import { OutputProcessor } from './helpers/outputs-processor';

// Main Program
const inputPath = findPath('backend/outputs.json');
const outputPath = findPath('frontend/backendOutputs.json');
const propertiesToExtract = [
    'translationsApiBaseUrl'
];

const processor = new OutputProcessor(inputPath, outputPath, propertiesToExtract);

processor.process();
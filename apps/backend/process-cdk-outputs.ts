import path from 'path';
import { OutputProcessor } from './helpers/outputs-processor';

// Main Program
const inputPath = path.join(__dirname, 'outputs.json');
const outputPath = path.join(__dirname, '..', 'frontend', 'src', 'config', 'backendOutputs.json');
const propertiesToExtract = [
    'translationsApiBaseUrl'
];

const processor = new OutputProcessor(inputPath, outputPath, propertiesToExtract);

processor.process();
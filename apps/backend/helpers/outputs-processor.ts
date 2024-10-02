import * as fs from 'fs';
import * as path from 'path';

import { findNestedProperty } from './find-nested-property';

export class OutputProcessor {
  constructor(
    private inputPath: string,
    private outputPath: string,
    private propertiesToExtract: string[]
  ) { }

  private readCdkOutputs(filePath: string): Record<string, any> {
    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData);
  }

  private extractProperties(cdkOutputs: Record<string, any>, propertiesToExtract: string[]): Record<string, string> {
    const extractedOutputs: Record<string, string> = {};
    for (const prop of propertiesToExtract) {
      const value = findNestedProperty(cdkOutputs, prop);
      if (value !== undefined) {
        extractedOutputs[prop] = value;
      }
    }
    return extractedOutputs;
  }

  private writeOutputs(filePath: string, data: Record<string, string>): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  private ensureDirectoryExists(dirPath: string): void {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  public process(): void {
    const cdkOutputs = this.readCdkOutputs(this.inputPath);
    const extractedOutputs = this.extractProperties(cdkOutputs, this.propertiesToExtract);

    this.ensureDirectoryExists(path.dirname(this.outputPath));
    this.writeOutputs(this.outputPath, extractedOutputs);
    console.log(`Extracted outputs have been written to: ${this.outputPath}`);
  }
}


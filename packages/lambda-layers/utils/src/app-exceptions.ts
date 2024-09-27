export class MissingEnvironmentVariableException extends Error {
  constructor(variableName: string) {
    super(`Missing required ${variableName} environment variable`);
  }
}

export class UnsupportedLanguagePairException extends Error {
  constructor(sourceLanguageCode: string, targetLanguageCode: string) {
    super(`Unsupported language pair: ${sourceLanguageCode} to ${targetLanguageCode}`);
  }
}

export class MissingRequestBodyException extends Error {
  constructor() {
    super("Missing request body");
  }
}

export class MissingParametersException extends Error {
  constructor(parameterName: string) {
    super(`Missing required ${parameterName} parameter`);
  }
}

export class MissingTableNameException extends Error {
  constructor(tableName: string) {
    super(`Missing required ${tableName} table name`);
  }
}


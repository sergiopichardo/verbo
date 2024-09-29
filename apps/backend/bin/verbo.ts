#!/usr/bin/env node
import "source-map-support/register";
import path from "path";

import * as cdk from "aws-cdk-lib";
import { ApiStack } from "../lib/api-stack";
import { DynamoDBStack } from "../lib/dynamodb-stack";
import { ComputeStack } from "../lib/compute-stack";
import { StaticWebsiteHostingStack } from "../lib/static-website-hosting";
import dotenv from "dotenv";

dotenv.config();

const appName = "Verbo"

const app = new cdk.App();

const dynamodbStack = new DynamoDBStack(app, `${appName}DynamoDBStack`, {});

const computeStack = new ComputeStack(app, `${appName}ComputeStack`, {
  translationsTable: dynamodbStack.translationsTable,
});


new ApiStack(app, `${appName}ApiStack`, {
  translationsTable: dynamodbStack.translationsTable,
  translateLambda: computeStack.translateLambda,
  getTranslationsLambda: computeStack.getTranslationsLambda,
});

new StaticWebsiteHostingStack(app, `${appName}StaticWebsiteHostingStack`, {
  domainName: process.env.DOMAIN as string,
  subdomain: process.env.SUBDOMAIN as string,
  frontendBuildPath: path.join(__dirname, "../../frontend/dist"),
  env: {
    account: process.env.AWS_ACCOUNT as string,
    region: process.env.AWS_REGION as string,
  }
});

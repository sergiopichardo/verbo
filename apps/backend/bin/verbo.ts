#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ApiStack } from "../lib/api-stack";
import { DynamoDBStack } from "../lib/dynamodb-stack";
import { ComputeStack } from "../lib/compute-stack";

const appName = "Verbo"

const app = new cdk.App();

const computeStack = new ComputeStack(app, `${appName}ComputeStack`, {});

const dynamodbStack = new DynamoDBStack(app, `${appName}DynamoDBStack`, {
  appName: appName,
});

new ApiStack(app, `${appName}ApiStack`, {
  translationsTable: dynamodbStack.translationsTable,
  translationLambda: computeStack.translationLambda,
});

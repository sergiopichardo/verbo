#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { VerboStack } from "../lib/verbo-stack";
import { DynamoDBStack } from "../lib/dynamodb-stack";

const app = new cdk.App();
const dynamodbStack = new DynamoDBStack(app, "DynamoDBStack", {});
new VerboStack(app, "VerboStack", {
  translationsTable: dynamodbStack.translationsTable,
});

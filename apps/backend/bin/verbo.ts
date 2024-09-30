#!/usr/bin/env node
import "source-map-support/register";
import path from "path";

import * as cdk from "aws-cdk-lib";
import dotenv from "dotenv";

import { RootStack } from "../lib/root-stack";

dotenv.config();

const app = new cdk.App();

new RootStack(app, `VerboStack`, {
  env: {
    account: process.env.AWS_ACCOUNT as string,
    region: process.env.AWS_REGION as string,
  },
  appName: "Verbo",
  domainName: process.env.DOMAIN as string,
  subdomain: process.env.SUBDOMAIN as string,
  apiSubDomain: process.env.API_SUBDOMAIN as string,
  frontendBuildPath: path.join(__dirname, "../../frontend/dist"),
  cloudFrontFunctionFilePath: path.join(__dirname, "../cloudfront-functions/redirect-to-index-html.js"),
});

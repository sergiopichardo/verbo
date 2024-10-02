#!/usr/bin/env node
import "source-map-support/register";

import * as cdk from "aws-cdk-lib";

import { RootStack } from "./stacks/root-stack";
import { getConfig } from "../helpers";
import { findPath } from "../helpers/path-finder";

const app = new cdk.App();


new RootStack(app, 'Verbo', {
  appName: "Verbo",
  env: {
    account: getConfig('awsAccountId'),
    region: getConfig('awsRegion'),
  },
  domainName: getConfig('domainName'),
  subdomain: getConfig('webSubDomain'),
  apiSubDomain: getConfig('apiSubDomain'),
  frontendBuildPath: findPath('frontend/dist'),
  cloudFrontFunctionFilePath: findPath('cloudfront-functions/redirect-to-index-html.js'),
});

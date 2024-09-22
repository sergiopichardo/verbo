import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";

import { Construct } from "constructs";

interface VerboStackProps extends cdk.StackProps {

}

export class VerboStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: VerboStackProps) {
    super(scope, id, props);

    this.createTranslationLambda()
  }
}

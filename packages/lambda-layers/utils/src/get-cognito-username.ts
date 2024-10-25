import {
    APIGatewayProxyEvent,
  } from "aws-lambda";

export const getCognitoUsername = (event: APIGatewayProxyEvent): string => {
    const claims = event.requestContext.authorizer?.claims;
    return claims['cognito:username'];
}
import * as lambda from 'aws-lambda'

type CreateHandlerResponseInput = {
  statusCode: number;
  body: string;
}

export const createApiGatewayResponse = ({ 
  statusCode, 
  body 
}: CreateHandlerResponseInput): lambda.APIGatewayProxyResult => {
    return {
      statusCode,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
      },
      body,
    };
};

export const createSuccessJsonResponse = (body: object) => {
  return createApiGatewayResponse({ 
    statusCode: 200, 
    body: JSON.stringify(body) 
  });
}

export const createErrorJsonResponse = (body: string) => {
  return createApiGatewayResponse({ statusCode: 500, body: JSON.stringify(body) });
}

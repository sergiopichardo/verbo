export const sendResponse = (statusCode: number, body: any) => {
    return {
      statusCode,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
      },
      body: JSON.stringify(body),
    };
  };
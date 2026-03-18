import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export async function handler(_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  void _event;
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'ok', runtime: 'lambda' })
  };
}

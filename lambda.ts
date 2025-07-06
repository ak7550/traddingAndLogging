// src/lambda.ts
import { Handler } from 'aws-lambda';
import { createNestLambdaHandler } from './src/lambda-bootstrap.js';

export const handler: Handler = async (event, context) => {
  const lambdaHandler = await createNestLambdaHandler();
  return lambdaHandler(event, context);
};

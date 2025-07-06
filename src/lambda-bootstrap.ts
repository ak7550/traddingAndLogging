import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { createServer, proxy } from 'aws-serverless-express';
import express from 'express';
import { ValidationPipe } from '@nestjs/common';
import { CustomLogger } from './custom-logger.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import moment from 'moment-timezone';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

let cachedServer: any;

/**
 * Loads secrets from AWS Secrets Manager and sets them as process.env variables
 */
async function loadSecrets() {
  const client = new SecretsManagerClient({ region: 'ap-south-1' });

  const command = new GetSecretValueCommand({
    SecretId: 'aniket-secret', 
  });

  const response = await client.send(command);
  const secrets = JSON.parse(response.SecretString || '{}');

  for (const [key, value] of Object.entries(secrets)) {
    process.env[key] = value as string; 
  }
}

/**
 * Bootstraps NestJS inside AWS Lambda using aws-serverless-express
 */
export async function createNestLambdaHandler() {
  // Cache server for reuse across invocations (cold start optimization)
  if (cachedServer) return cachedServer;

  // Load secrets before NestJS initializes
  await loadSecrets();

  // Setup Express + Nest
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter, {
    bufferLogs: true,
  });

  // Set timezone
  moment.tz.setDefault('Asia/Kolkata');

  // Global pipes
  app.useLogger(new CustomLogger('NestApplication'));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'prod',
    }),
  );

  // Enable versioning
  app.enableVersioning();

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Api Examples')
    .setDescription('Trading and logging APIs by Aniket')
    .setVersion('1.0')
    .addTag('Trading')
    .addTag('Logging')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.init();

  // Create and cache server for Lambda
  const server = createServer(expressApp);
  cachedServer = (event, context) =>
    proxy(server, event, context, 'PROMISE').promise();

  return cachedServer;
}

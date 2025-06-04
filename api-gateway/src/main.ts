import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { getRmqHost } from './common/config/rmq/rmq.connection';
declare const module: any;

async function bootstrap() {
  // Create hybrid application (HTTP + Microservice)
  const app = await NestFactory.create(AppModule);

  // Microservice setup

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://${getRmqHost()}:5672`],
      queue: 'notification-service',
      queueOptions: {
        durable: true,
      },
    },
  });
  app.setGlobalPrefix('api');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Backbone API Gateway')
    .setDescription(
      'A comprehensive API Gateway for the Nestjs backend with microservices architecture',
    )
    .setVersion('1.0')
    .addTag('API Gateway')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });
  SwaggerModule.setup('api-docs', app, document);

  // Global settings
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });

  // Start both microservice and HTTP server
  await app.startAllMicroservices();
  await app.listen(3000);

  // Hot Module Replacement
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();

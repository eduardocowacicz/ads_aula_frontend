import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { FiltroHttpException } from './compartilhado/filtros/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new FiltroHttpException());

  const corsOrigem = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigem === '*' || !corsOrigem ? true : corsOrigem.split(',').map((o) => o.trim()),
    credentials: true,
  });

  const documentoSwagger = new DocumentBuilder()
    .setTitle('API — Sistema pequena empresa')
    .setDescription(
      'Protótipo REST para o projeto final (JWT, clientes, produtos, orçamentos). Contrato JSON em camelCase.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentoOpenApi = SwaggerModule.createDocument(app, documentoSwagger);
  SwaggerModule.setup('api/docs', app, documentoOpenApi);

  const porta = parseInt(process.env.PORT ?? '3001', 10);
  await app.listen(porta);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

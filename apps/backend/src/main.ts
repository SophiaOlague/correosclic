import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody: true -- necesario para verificar la firma HMAC del webhook de
  // Stripe (POST /payments/webhooks/stripe), que requiere los bytes crudos
  // del body. No excluye esa ruta del parser JSON global: Nest captura el
  // buffer crudo en request.rawBody ADEMÁS de parsear el body normalmente
  // para todas las demás rutas.
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.setGlobalPrefix('api');

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT ?? 3000;

  await app.listen(port);

  console.log(`🚀 CorreosClic API running on port ${port}`);
}

bootstrap();
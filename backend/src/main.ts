import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
// import helmet from 'helmet';
// import * as compression from 'compression';
import { AppModule } from "@/app.module";
// import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get config service
  const configService = app.get(ConfigService);
  const port = configService.get("PORT", 3001);
  const corsOrigin = configService.get("CORS_ORIGIN", "http://localhost:3000");

  // Use default logger for now
  // try {
  //   app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  // } catch (error) {
  //   console.warn('Winston logger not available, using default logger');
  // }

  // Security middleware (disabled for debugging)
  // try {
  //   app.use(helmet());
  //   app.use(compression());
  // } catch (error) {
  //   console.warn('Security middleware failed to load:', error.message);
  // }

  // CORS configuration
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // API prefix
  app.setGlobalPrefix("api");

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Prompt Assistant API")
    .setDescription("AI-powered prompt optimization service")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { CleanModule } from './payment_clean/CleanModule';

async function bootstrap() {
  const app = await NestFactory.create(CleanModule);
  await app.listen(process.env.PORT || 3000, () => {
    // make mock server
  });
}
bootstrap();

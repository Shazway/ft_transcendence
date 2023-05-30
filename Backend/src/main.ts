import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ServerKeyService } from './homepage/services/server-key/server-key.service';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('');
	const keyGen = app.get(ServerKeyService);
	keyGen.generateKey();
	await app.listen(3001);
}
bootstrap();

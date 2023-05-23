import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ServerKeyService } from './homepage/services/server-key/server-key.service';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('');
	const keyGen = app.get(ServerKeyService);
	keyGen.generateKey();
	await app.listen(3001);
	const server = app.getHttpServer();
	const router = server._events.request._router;

	const availableRoutes: [] = router.stack
		.map((layer) => {
			if (layer.route) {
				return {
					route: {
						path: layer.route?.path,
						method: layer.route?.stack[0].method
					}
				};
			}
		})
		.filter((item) => item !== undefined);
	console.log(availableRoutes);
}
bootstrap();

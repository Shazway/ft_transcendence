import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RoutesMapper } from '@nestjs/core/middleware/routes-mapper';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('');
	await app.listen(3001);
	const server = app.getHttpServer();
	const router = server._events.request._router;

	const availableRoutes: [] = router.stack
		.map((layer) => {
			if (layer.route) {
				return {
					route: {
						path: layer.route?.path,
						method: layer.route?.stack[0].method,
					},
				};
			}
		})
		.filter((item) => item !== undefined);
	console.log(availableRoutes);
}
bootstrap();

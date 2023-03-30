import {
	TypeOrmModuleAsyncOptions,
	TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import entities from '../../../entities/index';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export class VarFetchService {
	constructor(private env: { [k: string]: string | undefined }) {}

	private getValue(key: string, throwOnMissing = true): string {
		const value = this.env[key];
		if (!value && throwOnMissing) {
			throw new Error(`config error - missing env.${key}`);
		}

		return value;
	}

	public ensureValues(keys: string[]) {
		keys.forEach((k) => this.getValue(k, true));
		return this;
	}

	public getPort() {
		return parseInt(this.getValue('POSTGRES_PORT'));
	}

	public isProduction() {
		const mode = this.getValue('MODE', false);
		return mode != 'DEV';
	}

	public typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
		useFactory: async (): Promise<TypeOrmModuleOptions> => {
			return this.getTypeOrmConfig();
		},
	};

	public getTypeOrmConfig(): TypeOrmModuleOptions {
		const host = this.isProduction()
			? this.getValue('POSTGRES_HOST')
			: this.getValue('POSTGRES_HOST_DEV');
		const synchronize = this.isProduction() ? true : false;
		return {
			type: 'postgres',
			host,
			port: this.getPort(),
			username: this.getValue('POSTGRES_USER'),
			password: this.getValue('POSTGRES_PASSWORD'),
			database: this.getValue('POSTGRES_DATABASE'),
			entities: entities,
			synchronize,

			// migrationsTableName: 'migration',

			migrations: [__dirname + '/../migrations/*.ts'],
		};
	}
}

const varFetchService = new VarFetchService(process.env).ensureValues([
	'POSTGRES_HOST',
	'POSTGRES_PORT',
	'POSTGRES_USER',
	'POSTGRES_PASSWORD',
	'POSTGRES_DATABASE',
]);

export { varFetchService };

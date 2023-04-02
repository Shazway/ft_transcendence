import {
	TypeOrmModuleAsyncOptions,
	TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import entities from 'src/entities/index';
import { JwtModuleOptions } from '@nestjs/jwt';
import { DataSourceOptions } from 'typeorm';

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
		return process.env.NODE_ENV === 'production';
	}

	public typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
		useFactory: async (): Promise<TypeOrmModuleOptions> => {
			return this.getTypeOrmConfig();
		},
	};

	public getTypeOrmConfig(): TypeOrmModuleOptions {
		console.log(this.isProduction());
		const host = this.isProduction()
			? this.getValue('POSTGRES_HOST')
			: this.getValue('POSTGRES_HOST_DEV');
		const synchronize = this.isProduction() ? false : true;
		return {
			type: 'postgres',
			host,
			port: this.getPort(),
			username: this.getValue('POSTGRES_USER'),
			password: this.getValue('POSTGRES_PASSWORD'),
			database: this.getValue('POSTGRES_DATABASE'),
			entities: entities,
			synchronize,
			migrations: [__dirname + '/../migrations/*.ts'],
		};
	}

	public getDatasourceConfig(): DataSourceOptions {
		return {
			type: 'postgres',
			host: this.getValue('POSTGRES_HOST'),
			port: this.getPort(),
			username: this.getValue('POSTGRES_USER'),
			password: this.getValue('POSTGRES_PASSWORD'),
			database: this.getValue('POSTGRES_DATABASE'),
			entities: entities,
			migrations: ['src/migrations/*.ts'],
		};
	}

	public getJwt(): JwtModuleOptions {
		return {
			secret: this.getValue('JWT_SECRET'),
			signOptions: { expiresIn: this.getValue('JWT_TIMEOUT') },
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

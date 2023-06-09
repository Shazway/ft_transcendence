import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import entities from 'src/entities/index';
import { JwtModuleOptions } from '@nestjs/jwt';
import { DataSourceOptions } from 'typeorm';
import { Api } from 'src/homepage/dtos/Api.dto';

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
		}
	};

	public getTypeOrmConfig(): TypeOrmModuleOptions {
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
			migrations: [__dirname + '/../migrations/*.ts']
		};
	}

	public getDatasourceConfig(): DataSourceOptions {
		const host = this.isProduction()
			? this.getValue('POSTGRES_HOST')
			: this.getValue('POSTGRES_HOST_DEV');
		return {
			type: 'postgres',
			host,
			port: this.getPort(),
			username: this.getValue('POSTGRES_USER'),
			password: this.getValue('POSTGRES_PASSWORD'),
			database: this.getValue('POSTGRES_DATABASE'),
			entities: entities,
			migrations: ['src/migrations/*.ts']
		};
	}

	public getJwt(): JwtModuleOptions {
		return {
			secret: this.getValue('JWT_SECRET'),
			signOptions: { expiresIn: this.getValue('JWT_TIMEOUT') }
		};
	}
	public getAPIKeys(): Api {
		return {
			s_key: this.getValue('SECRET_KEY'),
			u_key: this.getValue('UID_KEY')
		};
	}
	public getMailCredentials(): { mail: string; pass: string } {
		return {
			mail: this.getValue('MAIL_ADDR'),
			pass: this.getValue('MAIL_PASS')
		};
	}
	public getMailKeys(): { key: string; domain: string } {
		return {
			key: this.getValue('MAIL_API_KEY'),
			domain: this.getValue('MAIL_DOMAIN')
		};
	}
}

const varFetchService = new VarFetchService(process.env).ensureValues([
	'POSTGRES_HOST',
	'POSTGRES_PORT',
	'POSTGRES_USER',
	'POSTGRES_PASSWORD',
	'POSTGRES_DATABASE'
]);

export { varFetchService };

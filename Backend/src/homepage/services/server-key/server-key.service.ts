import { Injectable } from '@nestjs/common';
import { random } from 'mathjs';

@Injectable()
export class ServerKeyService {
	private key: number;

	generateKey() {
		this.key = Math.round(random(100000, 999999));
	}
	getKey(): number {
		return this.key;
	}
}

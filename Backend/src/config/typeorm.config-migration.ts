import { varFetchService } from 'src/homepage/services/var_fetch/var_fetch.service';
import { DataSource } from 'typeorm';

export const connectionSource = new DataSource(
		varFetchService.getDatasourceConfig(),
);

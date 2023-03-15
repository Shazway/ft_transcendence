import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users/users.controller';
import { UsersService } from './service/users/users.service';

@Module({
controllers: [UsersController],
providers: [UsersService]
})
export class UsersModule{
}

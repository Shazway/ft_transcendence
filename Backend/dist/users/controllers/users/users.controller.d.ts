import { Request, Response } from 'express';
import { UsersService } from 'src/users/service/users/users.service';
import { CreateUserDto } from 'src/users/controllers/dtos/CreateUser.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getUsers(req: Request, res: Response): void;
    getUsersPosts(): {
        username: string;
        email: string;
        createdAt: Date;
        matchsHistory: {
            id: number;
            result: string;
        }[];
    };
    getMatchHistory(us: string, req: Request, res: Response): void;
    createCustomer(req: Request, createUsersDto: CreateUserDto): void;
}

import { CreateUserDto, SerializedUserDto } from 'src/users/controllers/dtos/CreateUser.dto';
export declare class UsersService {
    users: {
        username: string;
        email: string;
        createdAt: Date;
        matchsHistory: {
            id: number;
            result: string;
        }[];
    }[];
    findUser(username: string): {
        username: string;
        email: string;
        createdAt: Date;
        matchsHistory: {
            id: number;
            result: string;
        }[];
    };
    createUser(userDto: CreateUserDto): void;
    getAllUsers(): SerializedUserDto[];
}

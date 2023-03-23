"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const CreateUser_dto_1 = require("../../controllers/dtos/CreateUser.dto");
let UsersService = class UsersService {
    constructor() {
        this.users = [
            {
                username: 'tmoragli',
                email: 'tmoragli@student.42.fr',
                createdAt: new Date(),
                matchsHistory: [
                    { id: 1, result: '2/1' },
                    { id: 2, result: '8/0' },
                ],
            },
            {
                username: 'tmoragli2',
                email: 'tmoragli2@student.42.fr',
                createdAt: new Date(),
                matchsHistory: [
                    { id: 1, result: '1/2' },
                    { id: 2, result: '0/8' },
                ],
            },
            {
                username: 'tmoragli3',
                email: 'tmoragli3@student.42.fr',
                createdAt: new Date(),
                matchsHistory: [],
            },
        ];
    }
    findUser(username) {
        return this.users.find((user) => user.username === username);
    }
    createUser(userDto) {
        userDto.createdAt = new Date();
        this.users.push(userDto);
    }
    getAllUsers() {
        return this.users.map((user) => (0, class_transformer_1.plainToClass)(CreateUser_dto_1.SerializedUserDto, user));
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)()
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map
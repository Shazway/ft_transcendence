interface MatchHistory {
    id: number;
    result: string;
}
export declare class CreateUserDto {
    username: string;
    email: string;
    createdAt: Date;
    matchsHistory: MatchHistory[];
}
export declare class SerializedUserDto {
    username: string;
    email: string;
    createdAt: Date;
    matchsHistory: MatchHistory[];
}
export {};

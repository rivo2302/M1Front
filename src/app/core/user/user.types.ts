export interface User
{
    _id: string;
    email: string;
    avatar?: string;
    favoriteEmployees?: any[],
    workSchedule?: string,
    lastName: string,
    firstName: string,
    role: string,
    salary?: number,
    password: string,
    name?: string,
    status?: string
}

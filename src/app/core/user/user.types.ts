export interface User
{
    _id: string;
    email: string;
    avatar?: string;
    favoriteEmployees?: any[],
    workSchedule?: [],
    lastName: string,
    firstName: string,
    role: string,
    salary?: number,
    commissionPercentage?: number,
    password: string,
    name?: string,
    status?: string
}

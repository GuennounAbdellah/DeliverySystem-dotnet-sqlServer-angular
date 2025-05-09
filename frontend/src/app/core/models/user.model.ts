export interface User {
    id: string;
    username: string;
    role: string;
}
  
export interface UserCreateRequest {
    username: string;
    password: string;
    role: string;
}
export const BACKEND_BASE_URL : string = 'http://127.0.0.1:8000'
export const COOKIE_NAME : string = 'my_token'


export type User = {
    username: string,
    follows: number, 
}

export const Users : User[] = [
    {username: 'hicham', follows: 120},
    {username: 'haghoulid', follows: 60},
    {username: 'mtadlaou', follows: 12},
    {username: 'aankote', follows: 14},
    {username: 'test', follows: 1},
]

export interface UserState {
    id : number,
    first_name : string,
    last_name: string,
    username: string,
    status: boolean,
    avatar: string,
    createdAt: Date,
    is_online: boolean,
    is_2af_active: boolean,
    email: string,
}

export interface chatRoom {
    id: number,
    user: UserState,
    last_updated:  Date,
    chat_status: boolean,
    banner_id: number,
}


export interface Message {
    message_user: UserState,
    message_content:  string,
    send_date: Date,
    read_date: Date,
}

export interface MessagesComponentProps {
    chatRoom: chatRoom
}
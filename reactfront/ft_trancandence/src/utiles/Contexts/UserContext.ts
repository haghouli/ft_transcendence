import React, { createContext } from "react";
import { UserState } from "../constents";


export interface UserContextType {
    user: UserState | undefined;
    setUser: React.Dispatch<React.SetStateAction<UserState | undefined>>;
    isLoggedIn: boolean,
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}
  
export const userContext = createContext<UserContextType>({
    user: undefined,
    setUser: () => {},
    isLoggedIn: false,
    setIsLoggedIn: () => {},
});
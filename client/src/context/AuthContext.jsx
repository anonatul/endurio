import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {

        const load = async () => {
            try {

                const response = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
                    method: "GET",
                    credentials: "include"
                });
                
                if (!response.ok) return;

                const data = (await response.json()).data;

                setUser(data);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Error fetching user profile:", error);
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        load();

    }, []);


    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);


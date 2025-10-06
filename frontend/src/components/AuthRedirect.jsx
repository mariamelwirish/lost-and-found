import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN } from "../constants.js";
import { useState, useEffect } from "react";

function AuthRedirect({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        checkAuth();
    }, [])

    const checkAuth = () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return;
        }
        
        try {
            const decoded = jwtDecode(token);
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;
            
            if (tokenExpiration < now) {
                setIsAuthorized(false);
            } else {
                setIsAuthorized(true);
            }
        } catch (error) {
            setIsAuthorized(false);
        }
    }

    if (isAuthorized === null) {
        return <div>Loading...</div>
    }

    return isAuthorized ? <Navigate to="/home" /> : children
}

export default AuthRedirect

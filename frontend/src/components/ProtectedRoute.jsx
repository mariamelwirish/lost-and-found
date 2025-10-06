// import {Navigate} from "react-router-dom";
// import {jwtDecode} from "jwt-decode";
// import api from "../api";
// import {REFRESH_TOKEN} from "../constants.js";
// import {ACCESS_TOKEN} from "../constants.js";
// import {useState, useEffect} from "react";

// function ProtectedRoute({children}) {
//     const [isAuthorized, setIsAuthorized] = useState(null);

//     useEffect(() => {
//         auth().catch(() => setIsAuthorized(false));
//     }, [])

//     const refreshToken = async () => {
//         const refreshToken = localStorage.getItem(REFRESH_TOKEN);
//         try {
//             const response = await
//                 api.post('api/token/refresh/', {refresh: refreshToken});
//             if (response.status === 200) {
//                 localStorage.setItem(ACCESS_TOKEN, response.data.access);
//                 setIsAuthorized(true);
//             } else {
//                 setIsAuthorized(false);
//             }
//         } catch (error) {
//             console.log('Error refreshing token:', error);
//             setIsAuthorized(false);
//         }
//     }

//     const auth = async () => {
//         const token = localStorage.getItem(ACCESS_TOKEN);
//         if (!token) {
//             setIsAuthorized(false);
//             return;
//         }
//         const decoded = jwtDecode(token);
//         const tokenExpiration = decoded.exp;
//         const now = Date.now() / 1000;

//         if (tokenExpiration < now) {
//             await refreshToken();
//         } else {
//             setIsAuthorized(true);
//         }
//     }

//     if (isAuthorized === null) {
//         return <div>Loading...</div>
//     }

//     return isAuthorized ? children : <Navigate to="/login"/>
// }

// export default ProtectedRoute
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // DEV BYPASS: while running `npm run dev`, allow every route without login
  if (import.meta.env.DEV) return children;

  // Your real auth check (kept for production)
  const authed = false; // TODO: replace with your token/session check
  return authed ? children : <Navigate to="/login" replace />;
}
 

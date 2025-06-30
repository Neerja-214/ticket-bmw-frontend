
// import React, { Children }   from "react"
// import { Navigate, useNavigate } from "react-router-dom"
// import { getCmpId } from "./utilities"
// import { getLvl, getWho } from "./cpcb"

// type Props = {
//     children :JSX.Element
// }


//  export const NrjRequire  = ({children}:Props) : JSX.Element =>{
//     const showPageNotFound = <><h4 className="m-3 p-4 text-center font-semibold text-lg"> Page Not Found</h4></>;
//     const protectedRoutes: string[] = ["/changePwdRgd", "/changePwdSpcb"]

//     let cmpid:string = getCmpId();
//     let lvl:string = getLvl();
//     let who = getWho();
//     return children
//     if (cmpid && who){
//         let cmp : string =cmpid
//         if (cmp.length > 4){
//             let foundProtectedRoute:boolean = false;
//             for(let i = 0; i < protectedRoutes.length; i++){
//                 if(window.location.pathname == protectedRoutes[i] && lvl != 'CPCB'){
//                     foundProtectedRoute = true;
//                     break;
//                 }
//             }
//             if(foundProtectedRoute){
//                 <Navigate to ="/login"></Navigate>
//             }

//             return children;
//         }
//     }
//     return <Navigate to ="/login"></Navigate>
// }

import React, { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCmpId, postLinux } from "./utilities";
import { getLvl, getWho } from "./cpcb";
import { nrjAxiosRequestLinux } from "src/Hooks/useNrjAxios";
import { useQuery } from "@tanstack/react-query";
import { useToaster } from "src/components/reusable/ToasterContext";
import { Link, useNavigate } from "react-router-dom";

type Props = {
    children: ReactNode;
};


export const NrjRequire = ({ children }: Props): JSX.Element => {
    const location = useLocation();
    const protectedRoutesRd: string[] = ["/changePwdRgd"];
    const protectedRoutesSpcb: string[] = ["/changePwdSpcb"];
    const protectedRoutesHcf: string[] = ['/hcfDetails'];
    const { showToaster, hideToaster } = useToaster();
    const navigate = useNavigate();

    const cmpid: string | null = getCmpId();
    const lvl: string | null = getLvl();
    const who = getWho();


    const { data: dataC, refetch: refetchC } = useQuery({
        queryKey: ['logout'],
        queryFn: logoutApi,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: logoutApiSuccess,
    })


    function logoutApi() {

        let base64Data = sessionStorage.getItem('isLoggedOut') || "";
        let jsonData = atob(base64Data)
        if (jsonData) {
            let data = JSON.parse(jsonData);
            let payload: any = postLinux('M/SSM110041DLCDG6042' + "=" + '22ffd3cb69804c3ba561aee92606f4bc', "logout");
            return nrjAxiosRequestLinux('logout', payload)
        } 


    }

    function logoutApiSuccess(data: any) {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login");
    }


    useEffect(() => {
        console.log(sessionStorage)
        const isProtectedRouteRd = protectedRoutesRd.includes(location.pathname);
        const isProtectedRouteSpcb = protectedRoutesSpcb.includes(location.pathname);
        const isProtectedRouteHcf = protectedRoutesHcf.includes(location.pathname);

        if ((!cmpid && !who) && (isProtectedRouteRd && lvl !== "CPCB") || (isProtectedRouteSpcb && lvl !== "CPCB") ||(isProtectedRouteHcf && lvl !== "HCF")) {
            refetchC();
        }
    }, [cmpid, lvl, who, location.pathname]); // Dependency array includes variables that can change

    // Redirect to login if cmpid or who is missing
    if (!cmpid || !who) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;


};

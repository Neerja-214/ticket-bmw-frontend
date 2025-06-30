import axios, { AxiosRequestConfig } from "axios"

type apiNrj = {
    apiCall: string,
    config?: any,
    whchServer?: string
}



export const nrjAxios = (props: apiNrj) => {

    let wch: string = props.whchServer ? props.whchServer : ""


    if (props.apiCall.indexOf("https:") === -1) {
        if (!wch) {
            if (sessionStorage.getItem("fhddezeeaa") && sessionStorage.getItem("fhddezeeaa") == "1") {
                props.apiCall = "https://biowaste.in/" + props.apiCall
            } else {
                props.apiCall = "https://biowaste.in/" + props.apiCall
            }

            // props.apiCall = "https://biowaste.in/" + props.apiCall
        } else {
            if (wch == "tsk") {
                props.apiCall = "https://www.thetaskmate.in/" + props.apiCall
            } else {
                if (sessionStorage.getItem("fhddezeeaa") && sessionStorage.getItem("fhddezeeaa") == "1") {
                    props.apiCall = "https://biowaste.in/" + props.apiCall
                } else {
                    props.apiCall = "https://biowaste.in/" + props.apiCall
                }

                // 
            }
        }
    }
    if (wch == "tsk" || props.apiCall.indexOf("taskmate.in") > -1 || props.apiCall.indexOf("vnenterpr") > -1) {
        return axios.get(props.apiCall);
    } else {
        return axios.post(props.apiCall, props.config);
    }
}


export const useNrjAxios = (props: apiNrj) => {
    if (props.apiCall.indexOf("https:") === -1) {
        //props.apiCall = "https://www.thetaskmate.in/" + props.apiCall
    }
    // https://api.swachhtaabhiyan.com/
    // return axios.get('https://api.swachhtaabhiyan.com/')
    if (sessionStorage.getItem("fhddezeeaa") && sessionStorage.getItem("fhddezeeaa") == "1") {
        return axios.get('https://biowaste.in/')
    } else {
        return axios.get('https://biowaste.in/')
    }

    // return axios.get('https://biowaste.in//')
    // return axios.get('https://biowaste.in/')
}


export const nrjAxiosRequest = (url: string, data: any) => {

    let cmpid = sessionStorage.getItem('cmpid');
   
    if (!cmpid || cmpid.trim() === "") {
        cmpid = Math.random().toString(36).substring(2, 15); // Generate a random ID
    }
    if (url.indexOf("https:") === -1) {
        // url = 'https://api.swachhtaabhiyan.com/' + url
        // url = 'https://biowaste.in/' + url
        // url = 'https://biowaste.in/' + url
        if (sessionStorage.getItem("fhddezeeaa") && sessionStorage.getItem("fhddezeeaa") == "1") {
            url = 'https://biowaste.in/' + url
        } else {
            url = 'https://biowaste.in/' + url
        }

    }
    let config: AxiosRequestConfig = {
        method: 'post',
        url: url,
        data: data,
        headers: {
            'Authorization': `Bearer ${cmpid}`,
            'Content-Type': 'application/json',
            // Add more headers as needed
        }

    }
    return axios.request(config);
}

export const nrjAxiosRequestLinux = (url: string, data: any) => {
    let cmpid = sessionStorage.getItem('cmpid');
   
    if (!cmpid || cmpid.trim() === "") {
        cmpid = Math.random().toString(36).substring(2, 15); // Generate a random ID
    }
    if (url.indexOf("http") === -1) {
        // url = 'https://api.swachhtaabhi yan.com/' + url
        //url = 'https://api.cliniciankhoj.com/' + url
        // url = 'https://biowaste.in/' + url
        // url = 'https://biowaste.in/' + url
        // url = 'http://10.24.84.200/' + url
        if (sessionStorage.getItem("fhddezeeaa") && sessionStorage.getItem("fhddezeeaa") == "1") {
            url = 'https://biowaste.in/' + url
        } else {
            url = 'https://biowaste.in/' + url
        }

    }
    let config: AxiosRequestConfig = {
        method: 'post',
        url: url,
        data: data,
        headers: {
            'Authorization': `Bearer ${cmpid}`,
            'Content-Type': 'application/json',
            // Add more headers as needed
        }
    }
    return axios.request(config);
}

axios.interceptors.request.use((config:any) => {
    config.headers = {
      ...config.headers,
      
      // 1. X-XSS-Protection
      'X-XSS-Protection': '1; mode=block',
      
      // 2. Content-Security-Policy (basic example, customize as needed)
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; object-src 'none'",
      
      // 3. Referrer-Policy
      'Referrer-Policy': 'no-referrer',
      
      // 4. X-Content-Type-Options
      'X-Content-Type-Options': 'nosniff',
      
      // 5. Permissions-Policy
      'Permissions-Policy': 'geolocation=(self), microphone=()',
  
      // 6. Strict-Transport-Security (optional; set this only for HTTPS)
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    };
  
    return config;
  }, (error:any) => Promise.reject(error));
  

axios.interceptors.response.use(
    (response: any) => {
        // Do something with successful responses
        return response;
    },
    (error) => {
        // Do something with response errors
        if (error.response && error.response.status === 401 && window.location.pathname != "/") {
            // Perform the redirection here, for example:
            window.location.pathname = "/"; // Replace '/login' with your actual login page URL
        }
        // If it's not a 401 error, just return the error as-is
        return Promise.reject(error);
        //return Promise.reject(error);
    }
);

export const nrjAxiosRequestBio = (url: string, data: any) => {
    let cmpid = sessionStorage.getItem('cmpid');
    if (!cmpid || cmpid.trim() === "") {
        cmpid = Math.random().toString(36).substring(2, 15); // Generate a random ID
    }
    if (url.indexOf("http") === -1) {
        // url = 'https://api.swachhtaabhiyan.com/' + url;
        // url = 'https://biowaste.in/' + url
        // url = 'https://biowaste.in/' + url
        // url = 'http://10.24.84.200/' + url
        if (sessionStorage.getItem("fhddezeeaa") && sessionStorage.getItem("fhddezeeaa") == "1") {
            url = 'https://biowaste.in/' + url
        } else {
            url = 'https://biowaste.in/' + url
        }


    }
    let config: AxiosRequestConfig = {
        method: 'post',
        url: url,
        data: data,
        headers: {
            'Authorization': `Bearer ${cmpid}`,
            'Content-Type': 'application/json',
            // Add more headers as needed
        }
    }
    return axios.request(config);
}



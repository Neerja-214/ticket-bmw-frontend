import axios, { AxiosRequestConfig } from "axios";

// Define the shape of the API response (optional enhancement)
export interface APIResponse<T = any> {
  status: string;
  message: string;
  result?: T;
}

/**
 * Reusable POST API function using Axios
 * @param endpoint - Relative or absolute URL
 * @param payload - Data to be sent in POST request
 */
export const genericPostAPI = async <T = any>(
  endpoint: string,
  payload: object
): Promise<APIResponse<T>> => {
  try {
    let url = endpoint;

    // Add domain if endpoint is relative
    if (!url.startsWith("http")) {
      url = "https://bmwapp.barcodebmw.in/" + url;
    }

    const config: AxiosRequestConfig = {
      method: "post",
      url: url,
      data: payload,
      headers: {
        "Content-Type": "application/json",
        // You can add Authorization or other headers here
        // 'Authorization': `Bearer ${yourToken}`
      }
    };

    const response = await axios.request<APIResponse<T>>(config);
    return response.data;
  } catch (error: any) {
    console.error("API Error:", error);
    throw new Error("Something went wrong while connecting to the server.");
  }
};


import basUrl from "../Api/baseUrl"


const usePostDataWithImage = async (url, params) => {
    const config = {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    };

    const res = await basUrl.post(url, params, config);
    return res;
};

const usePostData = async (url, params) => {
    const config = {
        headers: {
            // Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    };
    const res = await basUrl.post(url, params, config);
    return res;
};
export { usePostData, usePostDataWithImage };


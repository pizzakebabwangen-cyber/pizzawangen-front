import { useState } from "react"
import ExtensionService from "../Services/ExtensionService"

const useGetExtensionsData = () => {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [extensionsData, setExtensionsData] = useState([])

    const getExtensionsData = async () => {
        try {
            setLoading(true);
            const res = await ExtensionService.getExtensions();
            if (res) {
                setLoading(false)
                setExtensionsData(res.data)
            }
        }
        catch (err) {
            setLoading(false)
            setError(error)
        }

    }
    return {
        loading, error, extensionsData, getExtensionsData
    }
}

export default useGetExtensionsData

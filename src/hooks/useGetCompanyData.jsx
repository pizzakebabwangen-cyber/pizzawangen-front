import { useState } from "react"
import CompanyService from "../Services/CompanyService"

const useGetCompanyData = () => {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [companyData, setCompanyData] = useState([])

    const getCompanyData = async () => {
        try {
            setLoading(true);
            const res = await CompanyService.getCompanyData();
            if (res) {
                setLoading(false)
                setCompanyData(res.data)
            }
        }
        catch (err) {
            setLoading(false)
            setError(error)
        }

    }
    return {
        loading, error, companyData, getCompanyData
    }
}

export default useGetCompanyData

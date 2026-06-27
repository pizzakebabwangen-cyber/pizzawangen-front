
const server = import.meta.env.VITE_SERVER;
const CompanyService = {
    getCompanyData: async () => {
        const res = await fetch(`${server}/api/Company/GetCompanyData`);
        const data = await res.json();
        return data;
    }
}



export default CompanyService;
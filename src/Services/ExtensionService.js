
const server = import.meta.env.VITE_SERVER;
const ExtensionService = {
    getExtensions: async () => {
        const res = await fetch(`${server}/api/Extension/GetAllExtensions`);
        const data = await res.json();
        return data;
    }
}
export default ExtensionService;
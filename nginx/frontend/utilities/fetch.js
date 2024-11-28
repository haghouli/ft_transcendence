export const fetchData = async (path) => {
    const response = await fetch(path);
    user.data = await response.json();
};

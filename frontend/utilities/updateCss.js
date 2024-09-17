const updateCss = (newCssPath) => {
    const newCssComponent = document.getElementById('css');
    newCssComponent.href = newCssPath;
};

export default updateCss;
const updateCss = (newCssPath) => {
    console.log(newCssPath);
    const newCssComponent = document.getElementById('css');
    newCssComponent.href = newCssPath;
};

export default updateCss;
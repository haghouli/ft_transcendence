const updateCss = (newCssPath) => {

    const newCssComponent = document.getElementById('css');
    newCssComponent.href = newCssPath;
    document.head.appendChild(newCssComponent);
};

document.getElementById('btn').addEventListener('click', () => {

    updateCss("./example.css");
});
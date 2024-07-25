const updateCss = (newCssPath) => {

    const newCssComponent = document.getElementById('css');
    newCssComponent.href = newCssPath;
    document.head.appendChild(newCssComponent);
};

document.getElementById('btn').addEventListener('click', () => {
    console.log('click');
    updateCss("./example.css");
});
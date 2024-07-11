export const editField = (fieldName) => {
    // console.log('ici');
    var inputField = document.getElementById(fieldName);
    
    if (inputField.hasAttribute('readonly')) {
        inputField.removeAttribute('readonly');
        inputField.focus();

        inputField.addEventListener('blur', function() {
            inputField.setAttribute('readonly', true);
        }, { once: true });
    }
};

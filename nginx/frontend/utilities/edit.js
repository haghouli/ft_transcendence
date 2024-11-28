export const editField = (fieldName) => {
    var inputField = document.getElementById(fieldName);
    
    if (inputField.hasAttribute('readonly')) {
        inputField.removeAttribute('readonly');
        inputField.focus();

        inputField.addEventListener('blur', function() {
            inputField.setAttribute('readonly', true);
        }, { once: true });
    }
};

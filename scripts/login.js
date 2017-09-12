module.exports = function login(username, password) {
    var event = new Event('change');

    const usernameInput = document.querySelector('input[type="email"]');
    usernameInput.value = username;
    usernameInput.dispatchEvent(event);

    const passwordInput = document.querySelector('input[type="password"]');
    passwordInput.value = password;
    passwordInput.dispatchEvent(event);

    document.querySelector('button.btn-submit').click();

    return true;  
}
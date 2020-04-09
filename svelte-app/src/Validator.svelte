<script context="module">
    const LOGIN_REG_EXP = /^[a-zA-Z]\w{5,25}$/;
    const PASSWORD_REG_EXP = /^\w{8,28}$/;

    export function isUsernameValid(username) {
        return LOGIN_REG_EXP.test(username);
    }

    export function isPasswordValid(password) {
        return PASSWORD_REG_EXP.test(password);
    }
</script>
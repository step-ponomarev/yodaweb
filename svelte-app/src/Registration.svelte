<script>
    import {ValidationError} from './Exceptions.svelte';
    import {AUTH_MODE, CSRF} from "./stores.js";
    import {isUsernameValid, isPasswordValid} from "./Validator.svelte";

    let usernameLabel;
    let passwordLabel;
    let confirmPasswordLabel;

    let registrationEvent = '';

    async function submitForm() {
        const form = document.querySelector('#registrationFrom');

        const username = form.username.value;
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;

        form.password.value = '';
        form.confirmPassword.value = '';

        await testUserData(username, password, confirmPassword);

        const user = {
            username: username,
            password: password,
            userRole: ['USER']
        };

        let response = await fetch('/registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'X-XSRF-TOKEN': $CSRF
            },
            body: JSON.stringify(user)
        });

        if (!response.ok) {
            throw new Error('server not found');
        }

        const USER_WAS_ADDED = ((await response.text()) === 'true');

        if (!USER_WAS_ADDED) {
            throw new ValidationError('user with that username already exists');
        }

        return 'Success!'
    }

    function testUserData(username, password, confirmPassword) {
        const USERNAME_IS_VALID = isUsernameValid(username);
        const PASSWORD_IS_VALID = isPasswordValid(password);
        const PASSWORDS_ARE_EQUAL = (confirmPassword === password);

        if (!USERNAME_IS_VALID) {
            throw new ValidationError('invalid username');
        }

        if (!PASSWORD_IS_VALID) {
            throw new ValidationError('invalid password');
        }

        if (!PASSWORDS_ARE_EQUAL) {
            throw new ValidationError('passwords mismatch');
        }
    }

    function handleRegisterClick(form) {
        registrationEvent = submitForm();

        form.preventDefault();
    }
</script>

<div class="registration">
    <div class="container">


        <div class="errorBlock">
            {#await registrationEvent}
                <div>...</div>
            {:then state}
                <div class="success">{state}</div>
            {:catch error}
                <div class="error">{error.message}</div>
            {/await}
        </div>

        <form class="registrationForm" id="registrationFrom" on:submit={handleRegisterClick}>
            <div class="loginForm__title">
                <h2>please sign up</h2>
            </div>

            <label class="inputAround">
                <div class="inputAround__text" name="label-div" bind:this={usernameLabel}>username</div>

                <input
                        type="text"
                        id="username"
                        name="username"
                        class="loginForm__input"
                        on:focus="{() => {
                            usernameLabel.style.color = 'rgb(73, 160, 235)';
                        }}"
                        on:focusout="{() => {
                            usernameLabel.style.color = 'rgb(125, 138, 150)';
                        }}"
                        required/>
            </label>
            <label class="inputAround">
                <div class="inputAround__text"
                     name="label-div"
                     bind:this={passwordLabel}>
                    password
                </div>

                <input
                        type="password"
                        id="password"
                        name="password"
                        class="loginForm__input"
                        on:focus="{() => {
                            passwordLabel.style.color = 'rgb(73, 160, 235)';
                        }}"
                        on:focusout="{() => {
                            passwordLabel.style.color = 'rgb(125, 138, 150)';
                        }}"
                        required/>
            </label>

            <label class="inputAround">
                <div class="inputAround__text"
                     name="label-div"
                     bind:this={confirmPasswordLabel}>
                    confirm password
                </div>

                <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        class="loginForm__input"
                        on:focus="{() => {
                            confirmPasswordLabel.style.color = 'rgb(73, 160, 235)';
                        }}"
                        on:focusout="{() => {
                            confirmPasswordLabel.style.color = 'rgb(125, 138, 150)';
                        }}"
                        required/>
            </label>

            <div class="loginForm__buttonArea">
                <button class="loginForm__submitButton"
                        type="submit">
                    register
                </button>
            </div>
            <a href="/"
               on:click="{() => {
                    AUTH_MODE.set('LOGIN');
               }}" class="loginLink">sign in</a>
            <input id="_csrf" name="_csrf" type="hidden" value={$CSRF}/>
        </form>
    </div>
</div>

<style>
    .registration {
        margin: 0;
        width: 100%;
        height: 100%;
        background-color: rgb(59, 66, 75);
        display: grid;
        justify-items: center;
        align-content: center;
    }

    .container {
        margin-bottom: 10em;
        color: white;
        background-color: rgb(23, 32, 42);
        width: max-content;
        height: auto;
        padding-top: 1em;
        padding-bottom: 4em;
        padding-left: 4em;
        padding-right: 4em;
        border-radius: 10%;
    }

    a {
        width: max-content;
        height: min-content;
        cursor: pointer;
        color: rgb(67, 148, 218);
    }

    a:hover {
        text-decoration: underline;
        text-decoration-color: rgb(18, 139, 245);
    }

    @import url("https://fonts.googleapis.com/css2?family=Roboto&display=swap");

    .container > form {
        display: grid;
        justify-items: center;
        gap: 1em 0em;
        width: 400px;
        height: 300px;
    }

    .loginForm__title {
        margin-top: 0.3em;
        display: grid;
        grid-auto-flow: column;
        justify-self: left;
        column-gap: 7em;
        width: 100%;
    }

    .loginForm__title > h2 {
        align-self: center;
        font-size: 26px;
        margin-bottom: -0.5em;
    }

    .loginLink {
        align-self: self-start;
        justify-self: right;
        font-size: 16px;
        border-radius: 10%;
        width: max-content;
        height: min-content;
        cursor: pointer;
        color: rgb(67, 148, 218);
    }

    .loginLink:hover {
        text-decoration: underline;
        text-decoration-color: rgb(18, 139, 245);
    }

    .inputAround {
        display: grid;
        padding: 0;
        width: 100%;
        background-color: rgb(28, 39, 51);
    }

    .inputAround__text {
        color: rgb(125, 138, 150);
        padding-left: 0.5em;
        width: max-content;
        margin-bottom: 0;
    }

    .loginForm__input {
        color: white;
        font-size: 18px;
        padding-left: 0.5em;
        padding-bottom: 0;
        border: none;
        border-bottom: 3px solid rgb(125, 138, 150);
        width: 97.5%;
        border-radius: 2%;
        background-color: transparent;
        text-align: left;
        margin-top: 0.2em;
    }

    .loginForm__input:focus {
        outline: none;
        border-bottom: 3px solid rgb(73, 160, 235);
    }

    .loginForm__buttonArea {
        display: grid;
        gap: 0em 2em;
    }

    .loginForm__buttonArea > .loginForm__submitButton {
        font-size: 26px;
        height: max-content;
        width: 10em;
        background-color: rgb(23, 32, 42);
        color: rgb(73, 160, 235);
        padding-bottom: 0.2em;
        border: 1.3px solid rgb(73, 160, 235);
        border-radius: 4%;
    }

    .loginForm__buttonArea > .loginForm__submitButton:hover {
        cursor: pointer;
        animation-name: chooseButton;
        animation-duration: 100ms;
        animation-fill-mode: forwards;
    }

    @keyframes chooseButton {
        100% {
            transform: scale(0.93, 0.93);
        }
    }

    .errorBlock {
        display: grid;
        justify-items: center;
        align-items: end;
        width: 100%;
        height: 2em;
        padding: 0;
        box-sizing: border-box;
    }

    .error {
        color: #700400;
    }

    .success {
        color: #104e00;
    }

</style>
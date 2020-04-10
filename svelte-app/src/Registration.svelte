<script>
    import {AUTH_MODE, CSRF} from "./stores.js";
    import {isUsernameValid, isPasswordValid} from "./Validator.svelte";

    let usernameLabel;
    let passwordLabel;
    let confirmPasswordLabel;

    let errors = [];

    async function submitForm() {
        const form = document.querySelector('#registrationFrom');
        errors = Array(0);

        const username = form.username.value;
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;

        const VALID = (confirmPassword === password)
                * isUsernameValid(username)
                * isPasswordValid(password);

        //TODO Сделать нормальную обработку через выброс ошибок

        if (VALID) {
            const user = {
                username: username,
                password: password,
                userRole: null
            };

            let response = await fetch('/registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    'X-XSRF-TOKEN': $CSRF
                },
                body: JSON.stringify(user)
            });

            if (response.ok) {
                const userWasAdded = await response.text();

                if (userWasAdded === 'true') {
                    AUTH_MODE.set('LOGIN');
                    window.location.pathname = '/';
                } else {
                    errors.push('user with that username already exists');
                }
            } else {
                errors.push('server not found');
            }
        } else {
            if (!isUsernameValid(username)) {
                errors.push('invalid username');
            }

            if (confirmPassword !== password) {
                errors.push('password mismatch');
            } else if (!isPasswordValid(password)) {
                errors.push('invalid password');
            }
        }

        form.password.value = '';
        form.confirmPassword.value = '';
    }
</script>

<div class="registration">
    <div class="container">
        {#if errors.length !== 0}
            <div class="errors">
                <li>
                    {#each errors as error}
                        <ul>{error}</ul>
                    {/each}
                </li>
            </div>
        {/if}

        <form class="registrationForm" id="registrationFrom">
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
                <div class="inputAround__text" name="label-div" bind:this={passwordLabel}>password</div>

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
                <div class="inputAround__text" name="label-div" bind:this={confirmPasswordLabel}>confirm password</div>

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
                <button class="loginForm__submitButton" type="button" on:click={submitForm}>register</button>
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

    .errors {
        display: grid;
        width: 100%;
        height: auto;
        justify-items: right;
    }

    .errors > li {
        display: grid;
        justify-items: left;
        width: 100%;
        color: #a2393f;
    }

    .errors > li > ul {
        text-align: center;
        margin: 0;
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
</style>
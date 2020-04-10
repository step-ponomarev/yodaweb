<script>
    import {USER, AUTH_MODE, CSRF} from "./stores.js";

    let usernameLabel;
    let passwordLabel;

    const getUser = async () => {
        const response = await fetch("/user", {redirect: "manual"});

        if (response.ok) {
            let user = await response.json();

            USER.set(user);
            AUTH_MODE.set('AUTHORIZED');
            window.location.pathname = '/';
        } else {
            alert("Invalid login or password.");
        }

    };

    async function submitForm(form) {
        const xhr = new XMLHttpRequest();
        const submittedForm = new FormData(form.target);

        xhr.open("POST", "/login");

        xhr.send(submittedForm);

        xhr.onload = () => {
            if (xhr.status == 200) {
                getUser().catch(e => {
                    alert(e);
                });
            }
        };

        form.target.username.value = "";
        form.target.password.value = "";

        form.preventDefault();
    }
</script>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Roboto&display=swap");

    .login {
        display: grid;
        width: 100%;
        height: 100%;
        margin: 0;
        background-color: rgb(23, 32, 42);
    }

    .container {
        justify-self: center;
        align-self: center;
        margin-bottom: 10em;
        color: white;
        background-color: rgb(23, 32, 42);
        width: max-content;
        height: max-content;
    }

    .container > form {
        display: grid;
        justify-items: center;
        gap: 1em 0em;
        width: 400px;
        height: 300px;
        margin: 2em;
        margin-top: 0em;
        margin-bottom: 0em;
    }

    .checkbox-label {
        display: grid;
        grid-auto-flow: column;
        font-size: 16px;
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

    .regLink {
        align-self: self-start;
        justify-self: right;
        font-size: 16px;
        border-radius: 10%;
        width: max-content;
        height: min-content;
        cursor: pointer;
        color: rgb(67, 148, 218);
    }

    .regLink:hover {
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
        padding-top: 0;
        padding-left: 0.5em;
        padding-bottom: 0;
        border: none;
        border-bottom: 3px solid rgb(125, 138, 150);
        width: 97.5%;
        border-radius: 2%;
        background-color: transparent;
        text-align: left;
        margin-top: -0.2em;
    }

    .loginForm__input:focus {
        outline: none;
        border-bottom: 3px solid rgb(73, 160, 235);
    }

    .loginForm__buttonArea {
        display: grid;
        grid-auto-flow: column;
        align-items: center;
        justify-items: left;
        gap: 0em 2em;
        justify-self: left;
    }

    .loginForm__buttonArea > label {
        display: grid;
        grid-auto-flow: column;
        align-items: center;
        column-gap: 0.5em;
        cursor: pointer;
    }

    .loginForm__buttonArea > .loginForm__submitButton {
        font-size: 26px;
        height: max-content;
        width: max-content;
        background-color: rgb(23, 32, 42);
        color: rgb(73, 160, 235);
        padding-bottom: 0.2em;
        width: 4em;
        border: 1.3px solid rgb(73, 160, 235);
        border-radius: 5%;
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

<div class="login">
    <div class="container">
        <form class="loginForm" on:submit={submitForm}>
            <div class="loginForm__title">
                <h2>please log in</h2>
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

            <div class="loginForm__buttonArea">
                <button class="loginForm__submitButton" type="submit">log in</button>
                <label class="checkbox-label">
                    <input type="checkbox" name="remember-me" class="defCheckMark"/>
                    remember me
                </label>
            </div>
            <a class="regLink" on:click="{() => {
                AUTH_MODE.set('REGISTRATION');
                window.location.pathname = '/';
            }}">sign up</a>
            <input id="_csrf" name="_csrf" type="hidden" value={$CSRF}/>
        </form>
    </div>
</div>

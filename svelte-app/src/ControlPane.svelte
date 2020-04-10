<script>
    import {CSRF, AUTH_MODE, USER} from "./stores.js";

    let name = 'Молодой';
    let surname = 'Платон';
    let login = 'molodoy2003';

    //TODO СДЕЛАТЬ ЗАПОЛНЕНИЯ ИЗ ПОЛУЧЕННОГО ПОЛЬЗОВАТЕЛЯ

    async function logout() {
        const logoutFunc = await fetch('/logout', {
            method: 'POST',
            redirect: '/',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'X-XSRF-TOKEN': $CSRF
            },
        });

        if (logoutFunc.ok) {
            await AUTH_MODE.set('LOGIN');
        }
    };
</script>


<style>
    .content {
        color: white;
        width: 100%;
        height: 100%;
        padding-top: 1em;

        background-color: rgb(30, 39, 50);
        box-sizing: border-box;
    }

    .imageBlock {
        display: grid;
        justify-items: left;
        width: 80px;
    }

    .personalPart {
        padding-top: 1em;
        padding-bottom: 1em;
        margin-left: 1em;
        margin-right: 1em;
        display: flex;
        align-items: center;
        justify-content: left;
        width: auto;

        border-radius: 5px;
    }

    #personalPicture {
        width: 100%;
        height: auto;
        border-radius: 100%;
    }

    .infoBlock {
        display: grid;
        align-self: start;
        gap: 0.3em 0em;
        margin-left: 2em;
        text-align: left;
    }

    .login {
        color: #e2e2e2;
        margin-bottom: 0.5em;
    }

    .boxesPart {
        display: grid;
        gap: 1em;
        margin-top: 3em;
        margin-left: auto;
        margin-right: auto;
        font-size: 22px;
    }

    .inbox {
        margin-bottom: 2em;
    }

    .boxButton {
        cursor: pointer;
        width: 100%;
        box-sizing: border-box;
        padding-top: 0.3em;
        padding-bottom: 0.3em;
        padding-left: 1em;
    }

    .boxButton:hover {
        background-color: rgb(73, 160, 236);
    }

    .logoutButton {
        cursor: pointer;
        position: absolute;
        right: 1em;
        bottom: 1em;
    }

    .logoutButton:hover {
        color: rgb(73, 160, 236);
        text-decoration: underline;
    }
</style>

<div class="content">
    <div class="personalPart">
        <div class="imageBlock">
            <img id="personalPicture" src="../image/m1000x1000.jpeg"/>
        </div>
        <div class="infoBlock">
            <div class="login">@{login}</div>
            <div class="name">{name}</div>
            <div class="surname">{surname}</div>
        </div>
    </div>

    <div class="boxesPart">
        <div class="inbox boxButton">Выходящие</div>
        <div class="boxButton">Сегодня</div>
        <div class="boxButton">На неделе</div>
        <div class="boxButton">Позже</div>
    </div>

    <div class="logoutButton" on:click={logout}>logout</div>
</div>
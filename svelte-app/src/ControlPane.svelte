<script>
    import {CSRF, USER, CURRENT_BOX, ENTERED_BOX, DRAGGED_TASK, TASKS} from "./stores.js";
    import {onMount} from "svelte";
    import {currentRoute} from "./router.js";

    export let updateTask;

    let name = '';
    let surname = '';
    let login = $USER.username;

    onMount(async () => {
        const buttons = Array.from(document.querySelectorAll(".boxButton"));

        buttons.forEach(button => {
            button.addEventListener('dragenter', dragEnter);
            button.addEventListener('dragleave', dragLeave);
            button.addEventListener('drop', dragDrop);
            button.addEventListener('dragover', dragOver);
        });
    });

    function dragEnter(elem) {
        elem.target.classList.add('boxButton__active');
        ENTERED_BOX.set(elem.target.id);
    }

    function dragLeave(elem) {
        if ($CURRENT_BOX !==  elem.target.id) {
            elem.target.classList.remove('boxButton__active');
        }

        ENTERED_BOX.set(null);
    }

    async function dragDrop(elem) {
        $DRAGGED_TASK.container = $ENTERED_BOX.toUpperCase();

        await updateTask($DRAGGED_TASK);

        await ENTERED_BOX.set(null);

        if ($CURRENT_BOX !==  elem.target.id) {
            elem.target.classList.remove('boxButton__active');
        }
    }

    function dragOver(elem) {
        elem.preventDefault();
    }

    CURRENT_BOX.subscribe(box => {
        if (box !== '') {
            const id = box.toLowerCase();
            const buttons = Array.from(document.getElementsByClassName('boxButton'));
            const button = document.getElementById(id);

            buttons.forEach(bt => {
                if (bt.id !== id) {
                    bt.classList.remove('boxButton__active');
                }
            });

            button.classList.add('boxButton__active');
        }
    });

    async function chooseButton(elem) {
        const button = elem.target;

        CURRENT_BOX.set(button.id.toUpperCase());

        currentRoute.set(`/${button.id}`);
        window.history.pushState({path: `/${button.id}`}, '', window.location.origin + `/${button.id}`);
    };

    async function logout() {
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'X-XSRF-TOKEN': $CSRF
            },
        });

        if (response.ok) {
            window.location.pathname = '/';
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

    .boxButton__active {
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
            <img id="personalPicture" src="../image/m1000x1000.png"/>
        </div>
        <div class="infoBlock">
            <div class="login">@{login}</div>
            <div class="name">{name}</div>
            <div class="surname">{surname}</div>
        </div>
    </div>

    <div class="boxesPart">
        <div class="inbox boxButton__active" hidden></div>
        <div class="inbox boxButton" id="inbox" on:click={chooseButton}>Входящие</div>
        <div class="boxButton" id="today" on:click={chooseButton}>Сегодня</div>
        <div class="boxButton" id="week" on:click={chooseButton}>На неделе</div>
        <div class="boxButton" id="late" on:click={chooseButton}>Позже</div>
    </div>

    <div class="logoutButton" on:click={logout}>logout</div>
</div>
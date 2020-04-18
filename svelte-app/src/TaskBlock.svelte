<script>
    import {CSRF, TASKS} from './stores.js';
    import Checkbox from './Checkbox.svelte';
    import {onMount} from "svelte";

    export let task;
    export let updateTask;

    let content;
    let statementField;
    let deleteButton;

    let statementBeforeChanging;
    let statementAfterChanging;

    onMount(async () => {
        await setCompleteColor();
    });

    function setCompleteColor() {
        if (!task.completed) {
            statementField.style.color = 'white';
            statementField.style.textDecoration = 'none';
        } else {
            statementField.style.color = 'rgb(58, 68, 76)';
            statementField.style.textDecoration = 'line-through';
        }
    }

    function completeTaskEvent(taskState) {
        if (!taskState.target.checked) {
            statementField.style.color = 'white';
            statementField.style.textDecoration = 'none';
        } else {
            statementField.style.color = 'rgb(58, 68, 76)';
            statementField.style.textDecoration = 'line-through';
        }

        task.completed = !task.completed;

        updateTask(task);
    }

    function keyPressEvent(field) {
        if (field.keyCode === 13) {

            field.target.blur();

            statementField.preventDefault();
        }
    }

    function pasteEvent(field) {
        const text = field.clipboardData.getData('text');

        document.execCommand("insertHTML", false, text);

        field.preventDefault();
    }

    function focusEvent(field) {
        statementBeforeChanging = field.target.textContent.trim();
    }

    function focusoutEvent(field) {
        statementAfterChanging = field.target.textContent.trim();

        if (statementAfterChanging === statementBeforeChanging) {
            return;
        }

        if (statementAfterChanging.length === 0) {
            field.target.textContent = statementBeforeChanging;
        }

        task.statement = statementAfterChanging;

        updateTask(task);
    }

    function mouseCover() {
        deleteButton.style.display = 'block';
    }

    function onMouseOut() {
        deleteButton.style.display = 'none';
    }

    function setInputFocused() {
        statementField.focus();
    }

    async function deleteTask() {
        const response = await fetch('task', {
           method: 'DELETE',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'X-XSRF-TOKEN': $CSRF
            },

            body: JSON.stringify(task)
        });

        if (response.ok) {
            const tasks = $TASKS.slice().filter(deletedTask => task.id !== deletedTask.id);

            TASKS.set(tasks);
        }
    }
</script>

<style>
    .content {
        display: flex;
        width: 100%;
        padding: 0.5em;
        padding-right: 1em;
        padding-bottom: 0.3em;
    }

    .content:hover {
        background-color: rgb(30, 39, 50);
    }

    .taskBlock {
        display: flex;
        margin-right: 1em;
        margin-left: 1em;
        cursor: pointer;
        width: 100%;

        height: 100%;
        box-sizing: border-box;
    }

    .statementField {
        display: block;
        background-color: transparent;
        border: none;
        outline: none;
        color: white;
        font-size: 18px;
        cursor: text;
        overflow: hidden;
        white-space: pre-wrap;
        word-wrap: break-word;
        word-break: break-all;
    }

    .deleteButton {
        display: none;
        margin-left: auto;
        width: 1em;
        height: 1em;
        align-self: self-start;
    }

    .deleteButton::before {
        content: "\2716";
        color: rgb(58, 68, 76);
    }

    .deleteButton:hover::before  {
        transition: 200ms;
        transform: translateY(3);
        color: #700400;
    }
</style>

<div class="content"
     on:mouseover={mouseCover}
     on:mouseout={onMouseOut}
     bind:this={content}>
    <Checkbox
            checkEvent={completeTaskEvent}
            id={task.id}
            completed={task.completed}
    />
    <div class="taskBlock"
         on:click={setInputFocused}
    >
        <div
                class="statementField"
                contenteditable="true"
                type="text"
                spellcheck="false"
                onautocomplete="false"
                bind:this={statementField}
                on:keypress={keyPressEvent}
                on:focus={focusEvent}
                on:focusout={focusoutEvent}
                on:paste={pasteEvent}
        >
            {task.statement}
        </div>
        <div    bind:this={deleteButton}
                on:click={deleteTask}
                class="deleteButton">
        </div>
    </div>
</div>
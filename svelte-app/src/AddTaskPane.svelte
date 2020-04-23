<script>
    import {CSRF, USER, TASKS} from "./stores.js";

    let addTaskBlock;
    let arrowLabel;
    let addLabel;
    let inputField;

    async function enterEvent(field) {
        if (field.keyCode !== 13) {
            return;
        }

        await addTaskFromField();
    }

    async function addTaskFromField() {
        if (!inputField.value.trim()) {
            inputField.value = '';
            return;
        }

        const task = {
            completed: false,
            statement: inputField.value.trim(),
            dateOfCreation: new Date(Date.now()),
            dateOfFinish: null,
            creator: null,
            container: 'INBOX'
        };

        const response = await fetch('/task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'X-XSRF-TOKEN': $CSRF
            },
            body: JSON.stringify(task)
        });


        if (response.ok) {
            let tasks = $TASKS.slice();

            const addedTask = await response.json();

            await tasks.push({
                id: addedTask.id,
                statement: addedTask.statement,
                container: addedTask.container,
                completed: addedTask.completed
            });

            await TASKS.set(tasks);
        }

        inputField.value = '';
    }

    function focusInputFieldEvent() {
        addTaskBlock.style.borderColor = 'rgb(73, 160, 235)';
        arrowLabel.style.color = 'rgb(73, 160, 235)';

        addLabel.style.color = 'rgb(123, 177, 70)';
    }

    function focusoutInputFieldEvent() {
        addTaskBlock.style.borderColor = 'rgb(125, 138, 150)';
        arrowLabel.style.color = 'rgb(125, 138, 150)';
        addLabel.style.color = 'rgb(125, 138, 150)';
        addLabel.style.textShadow = 'none';
    }
</script>

<style>
    :root {
        --main-bg-color: rgb(23, 32, 42);
        --separator-color: rgb(58, 68, 76);
        --form-bg-color: rgb(28, 39, 51);
    }

    .addTaskBlock {
        display: flex;
        margin-left: auto;
        margin-right: auto;
        color: white;
        padding: 1em 1em 0.3em;
        width: 100%;
        background-color: var(--form-bg-color);
        border-bottom: 3px solid rgb(125, 138, 150);

        box-sizing: border-box;
    }

    input[type='text'] {
        margin-left: 1em;
        margin-right: 1em;
        border: none;
        outline: none;
        color: white;
        width: 100%;
        font-size: 22px;
        box-sizing: border-box;
        background-color: transparent;
    }

    #arrowLabel {
        font-size: 18px;
        color: rgb(125, 138, 150);
    }

    #addLabel {
        font-size: 20px;
        color: rgb(125, 138, 150);
        cursor: pointer;
    }
</style>

<div class="addTaskBlock" bind:this={addTaskBlock}>
    <label id="arrowLabel" bind:this={arrowLabel}>></label>
    <input
            type="text"
            spellcheck="false"
            placeholder="Добавить новую задачу"
            bind:this={inputField}
            on:keypress={enterEvent}
            on:focus={focusInputFieldEvent}
            on:focusout={focusoutInputFieldEvent}
    />
    <label
            id="addLabel"
            on:click={addTaskFromField}
            bind:this={addLabel}
    >
        #add
    </label>
</div>
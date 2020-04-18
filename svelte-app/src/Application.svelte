<script>
    import {onMount} from 'svelte';
    import {TASKS, CSRF, CURRENT_BOX} from './stores.js';
    import {currentRoute, router} from './router.js';

    import ControlPane from './ControlPane.svelte';
    import AddTaskPane from './AddTaskPane.svelte';
    import TaskPane from './TaskPane.svelte';

    onMount(async () => {
        await getTasks();

        await CURRENT_BOX.set($currentRoute.substring(1).toUpperCase());
    });

    async function getTasks() {
        const response = await fetch('/task', {
            method: 'GET'
        });

        if (response.ok) {
            const tasksFromServer = await response.json();

            const newTasks = [];
            await tasksFromServer.forEach(task => {

                newTasks.push({
                    id: task.id,
                    statement: task.statement,
                    dateOfCreation: new Date(task.dateOfCreation),
                    container: task.container,
                    completed: task.completed
                });
            });

            TASKS.set(newTasks);
        }
    }

    async function updateTask(task) {
        const updatedTask = {
            id: task.id,
            completed: task.completed,
            statement: task.statement,
            dateOfCreation: null,
            dateOfFinish: null,
            creator: null,
            container: task.container
        };

        const response = await fetch('/task', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'X-XSRF-TOKEN': $CSRF
            },

            body: JSON.stringify(updatedTask)
        });

        if (response.ok) {
            const tasksFromServer = await response.json();

            const newTasks = $TASKS;
            await newTasks.forEach(task => {
                if (tasksFromServer.id === task.id) {
                    task.statement = tasksFromServer.statement;
                    task.completed = tasksFromServer.completed;
                    task.container = tasksFromServer.container;
                }
            });

            await TASKS.set(newTasks);
        }
    }

    // TODO: Внедрить сортировку!
    function sortByCompleted(lv, rv) {
        if (lv.completed && !rv.completed) {
            return 1;
        } else if (!lv.completed && rv.completed) {
            return -1;
        } else {
            return 0;
        }
    }
</script>

<style>
    :root {
        --main-bg-color: rgb(23, 32, 42);
        --separator-color: rgb(58, 68, 76);
        --form-bg-color: rgb(28, 39, 51);
    }

    main {
        width: 100%;
        height: 100%;
        padding: 1em;
        box-sizing: border-box;
    }

    .app {
        display: flex;
        justify-content: left;
        width: 100%;
        height: 100%;
        background-color: var(--main-bg-color);
        box-sizing: border-box;
    }

</style>

<div class="app">
    <header>
        <ControlPane updateTask="{updateTask}"/>
    </header>
    <main>
        <AddTaskPane/>

        {#if $CURRENT_BOX === 'INBOX'}
            <TaskPane updateTask="{updateTask}" box={$CURRENT_BOX} movable={true}/>
        {/if}

        {#if $CURRENT_BOX === 'TODAY'}
            <TaskPane updateTask="{updateTask}" box={$CURRENT_BOX}/>
        {/if}

        {#if $CURRENT_BOX === 'WEEK'}
            <TaskPane updateTask="{updateTask}" box={$CURRENT_BOX}/>
        {/if}

        {#if $CURRENT_BOX === 'LATE'}
            <TaskPane updateTask="{updateTask}" box={$CURRENT_BOX}/>
        {/if}
    </main>
</div>


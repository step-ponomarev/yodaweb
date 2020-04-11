<script>
    import {onMount} from "svelte";
    import TaskBlock from './TaskBlock.svelte';

    let tasks = [];

    onMount(async () => {
       getTasks();
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
                    statement: task.statement
                });
            });

            tasks = newTasks;
        }
    }
</script>

<style>
    .taskPane {
        display: grid;
        gap: 0.2em;
        padding: 1em;
        margin-top: 2em;
        width: 100%;
        box-sizing: border-box;
        color: white;
        font-size: 20px;
    }

</style>

<div class="taskPane">
    {#each tasks as task}
        <TaskBlock id={task.id} statement={task.statement}/>
    {/each}
</div>
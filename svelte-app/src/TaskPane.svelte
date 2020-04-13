<script>
    import {onMount} from "svelte";
    import {TASKS} from './stores.js';
    import TaskBlock from './TaskBlock.svelte';

    export let box;
    export let updateTask;

    let tasks = Array();

    onMount(async () => {
        tasks = $TASKS.filter(task => (task.container === box));
    });

    TASKS.subscribe(newTasks => {
        tasks = newTasks.filter(task => (task.container === box));
    });

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
        <TaskBlock updateTask={updateTask} task={task}/>
    {/each}
</div>
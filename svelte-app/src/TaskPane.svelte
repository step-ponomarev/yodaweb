<script>
    import {onMount, afterUpdate} from "svelte";
    import {TASKS} from './stores.js';
    import DraggableTaskBlock from "./DraggableTaskBlock.svelte";

    export let box;
    export let updateTask;
    export let movable = false;

    let tasks = Array();

    onMount(async () => {
        let newTasks = await $TASKS.filter(task => (task.container === box));

        tasks = newTasks;
    });

    TASKS.subscribe(async updatedTasks => {
        let newTasks = await updatedTasks.filter(task => (task.container === box));

        tasks = newTasks;
    });
</script>

<style>
    .container {
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

<div class="container">
    {#each tasks as task}
        <DraggableTaskBlock updateTask={updateTask} task={task}/>
    {/each}
</div>
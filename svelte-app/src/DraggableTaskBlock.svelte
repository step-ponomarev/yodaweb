<script>
    import TaskBlock from './TaskBlock.svelte';
    import {DRAGGED_TASK} from "./stores.js";

    export let task;
    export let updateTask;

    let container;
</script>


<style>
    .container {
        display: flex;
        cursor: pointer;
    }
</style>

<div class="container"
     draggable="true"
     bind:this={container}
     on:dragstart="{(elem) => {
            DRAGGED_TASK.set(task);
            setTimeout(() => {
                    elem.target.style.display = 'none';
                }, 0);
     }}"
     on:dragend="{(elem) => {
         DRAGGED_TASK.set(null);
         elem.target.style.display = 'flex';
     }}"
>
    <TaskBlock updateTask={updateTask} task={task}/>
</div>
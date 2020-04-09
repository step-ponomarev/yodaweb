<script>
    import TaskBlock from './TaskBlock.svelte';

    const tasks = [
        {
            id: 1,
            statement: 'Купить игрушку дьяволы'
        },
        {
            id: 2,
            statement: 'Научить енота пользоваться телевизором'
        },
        {
            id: 3,
            statement: 'Позвонить Максу Дорофееву'
        },
        {
            id: 4,
            statement: 'Научить маму пользоваться девтулзами'
        }
    ];


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
<script>
    import ControlPane from './ControlPane.svelte';
    import AddTaskPane from './AddTaskPane.svelte';
    import ActualTaskPane from './ActualTaskPane.svelte';

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
        <ControlPane/>
    </header>
    <main>
        <AddTaskPane/>
        <ActualTaskPane/>
    </main>
</div>


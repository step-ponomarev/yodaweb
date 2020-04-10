<script>
    export let id;
    export let checkEvent;
</script>

<style>
    input[type=checkbox] {
        display: none;
    }

    input[type=checkbox] + label:before {
        cursor: pointer;
        display: inline-block;
        content: " ";
        align-content: center;
        border: 0.1em solid rgb(58, 68, 76);
        border-radius: 50%;
        width: 0.5em;
        height: 0.5em;
    }

    input[type=checkbox]:hover + label:before {
        animation-name: mouseFocusUnchecked;
        animation-fill-mode: forwards;
        animation-duration: 300ms;
        display: inline-block;
        color: rgba(58, 68, 76, 0.4);
    }

    @keyframes mouseFocusUnchecked {
        0% {
            box-shadow: 0px 0px 0px 0px, transparent;
        }

        100% {
            box-shadow: 0px 0px 0px 5px;
        }
    }

    input[type=checkbox]:checked + label:before {
        display: inline-block;
        color: rgb(73, 160, 236);
        background-color: rgb(73, 160, 236);
        border: 0.1em solid rgb(73, 160, 236);
    }


    input[type=checkbox]:checked:hover + label:before {
        animation-name: setUnchecked;
        animation-duration: 300ms;
        animation-fill-mode: forwards;
        color: white;
    }

    @keyframes setUnchecked {
        0% {
            box-shadow: 0px 0px 0px 0px, transparent;
            border: 0.1em solid rgb(58, 68, 76);
        }

        100% {
            background-color: rgb(73, 160, 236);
            border: 0.1em solid rgb(73, 160, 236);
            box-shadow: 0px 0px 0px 5px rgba(73, 160, 236, 0.4);
        }
    }
</style>

<input
        type="checkbox"
        id="task-{id}"
        class="css-checkbox"
        on:click={checkEvent}
/>
<label for="task-{id}" class="css-label"></label>
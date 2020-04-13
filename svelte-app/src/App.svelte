<script>
    import {onMount} from "svelte";
    import {
        SESSIONID,
        CSRF,
        USER,
        AUTHORIZED,
        AUTH_IS_CHECKED,
        CURRENT_BOX
    } from "./stores.js";

    import {currentRoute, router} from './router.js';

    import Application from "./Application.svelte";

    import {getCookie} from "./Utils.svelte";

    onMount(async () => {
        await getUsers();
        await saveCookies();

        if ($AUTHORIZED && (window.location.pathname === '/')) {
            await currentRoute.set('/today');
        } else {
            await currentRoute.set(window.location.pathname);
        }

        if (!$AUTHORIZED && (window.location.pathname === '/')) {
            await currentRoute.set('/login');
        }

        if (!history.state) {
            await window.history.replaceState({path: $currentRoute}, '', $currentRoute);
        }

        await AUTH_IS_CHECKED.set(true);
    });

    async function getUsers() {
        const response = await fetch("/user", {redirect: "manual"});

        if (response.ok) {
            let user = await response.json();

            await USER.set(user);
            await AUTHORIZED.set(true);
        }
    }

    function saveCookies() {
        const session = getCookie('JSESSIONID');
        const csrf = getCookie('XSRF-TOKEN');

        SESSIONID.set(session);
        CSRF.set(csrf);
    }

    function handlerBackNavigation(event) {
        currentRoute.set(event.state.path)
    }
</script>

<svelte:window
        on:popstate={handlerBackNavigation}
/>

{#if AUTH_IS_CHECKED}
    {#if $AUTHORIZED}
        <Application/>
    {:else}
        <svelte:component this={router[$currentRoute]}/>
    {/if}
{/if}



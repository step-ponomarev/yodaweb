<script>
    import {onMount} from "svelte";
    import {SESSIONID, CSRF, USER, AUTH_MODE} from "./stores.js";

    import Login from "./Login.svelte";
    import Registration from "./Registration.svelte";
    import Application from "./Application.svelte";

    import {getCookie} from "./Utils.svelte";

    onMount(async () => {
        const response = await fetch("/user", {redirect: "manual"});

        if (response.ok) {
            let user = await response.json();

            await USER.set(user);
            await AUTH_MODE.set('AUTHORIZED');
        }
    });

    function saveCookies() {
        const session = getCookie("JSESSIONID");
        const csrf = getCookie("XSRF-TOKEN");

        SESSIONID.set(session);
        CSRF.set(csrf);
    }
/*
    AUTH_MODE.subscribe(async () => {
        const response = await fetch("/user");

        if (response.ok) {
            let user = await response.json();

            USER.set(user);
            AUTH_MODE.set('AUTHORIZED');
        } else {
            AUTH_MODE.set('LOGIN');
            USER.set(null);
        }
    });

    saveCookies();*/
    AUTH_MODE.set('AUTHORIZED');
</script>

{#if $AUTH_MODE === 'LOGIN'}
    <Login/>
{:else if $AUTH_MODE === 'REGISTRATION'}
    <Registration/>
{:else if $AUTH_MODE === 'AUTHORIZED'}
    <Application/>
{/if}

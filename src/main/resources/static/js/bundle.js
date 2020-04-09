
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const SESSIONID = writable('');
    const CSRF = writable('');
    const USER = writable(null);
    const AUTH_MODE = writable('LOGIN'); // LOGIN REGISTRATION AUTHORIZED

    /* src/Login.svelte generated by Svelte v3.20.1 */
    const file = "src/Login.svelte";

    function create_fragment(ctx) {
    	let div5;
    	let div4;
    	let form;
    	let div0;
    	let h2;
    	let t1;
    	let label0;
    	let div1;
    	let t3;
    	let input0;
    	let t4;
    	let label1;
    	let div2;
    	let t6;
    	let input1;
    	let t7;
    	let div3;
    	let button;
    	let t9;
    	let label2;
    	let input2;
    	let t10;
    	let t11;
    	let a;
    	let t13;
    	let input3;
    	let dispose;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			form = element("form");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "please log in";
    			t1 = space();
    			label0 = element("label");
    			div1 = element("div");
    			div1.textContent = "username";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			label1 = element("label");
    			div2 = element("div");
    			div2.textContent = "password";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div3 = element("div");
    			button = element("button");
    			button.textContent = "log in";
    			t9 = space();
    			label2 = element("label");
    			input2 = element("input");
    			t10 = text("\n                    remember me");
    			t11 = space();
    			a = element("a");
    			a.textContent = "sign up";
    			t13 = space();
    			input3 = element("input");
    			attr_dev(h2, "class", "svelte-19a25bx");
    			add_location(h2, file, 194, 16, 4466);
    			attr_dev(div0, "class", "loginForm__title svelte-19a25bx");
    			add_location(div0, file, 193, 12, 4419);
    			attr_dev(div1, "class", "inputAround__text svelte-19a25bx");
    			attr_dev(div1, "name", "label-div");
    			add_location(div1, file, 198, 16, 4565);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "username");
    			attr_dev(input0, "name", "username");
    			attr_dev(input0, "class", "loginForm__input svelte-19a25bx");
    			input0.required = true;
    			add_location(input0, file, 200, 16, 4671);
    			attr_dev(label0, "class", "inputAround svelte-19a25bx");
    			add_location(label0, file, 197, 12, 4521);
    			attr_dev(div2, "class", "inputAround__text svelte-19a25bx");
    			attr_dev(div2, "name", "label-div");
    			add_location(div2, file, 214, 16, 5194);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "id", "password");
    			attr_dev(input1, "name", "password");
    			attr_dev(input1, "class", "loginForm__input svelte-19a25bx");
    			input1.required = true;
    			add_location(input1, file, 216, 16, 5300);
    			attr_dev(label1, "class", "inputAround svelte-19a25bx");
    			add_location(label1, file, 213, 12, 5150);
    			attr_dev(button, "class", "loginForm__submitButton svelte-19a25bx");
    			attr_dev(button, "type", "submit");
    			add_location(button, file, 231, 16, 5836);
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "name", "remember-me");
    			attr_dev(input2, "class", "defCheckMark");
    			add_location(input2, file, 233, 20, 5973);
    			attr_dev(label2, "class", "checkbox-label svelte-19a25bx");
    			add_location(label2, file, 232, 16, 5922);
    			attr_dev(div3, "class", "loginForm__buttonArea svelte-19a25bx");
    			add_location(div3, file, 230, 12, 5784);
    			attr_dev(a, "class", "regLink svelte-19a25bx");
    			add_location(a, file, 237, 12, 6126);
    			attr_dev(input3, "id", "_csrf");
    			attr_dev(input3, "name", "_csrf");
    			attr_dev(input3, "type", "hidden");
    			input3.value = /*$CSRF*/ ctx[2];
    			add_location(input3, file, 240, 12, 6251);
    			attr_dev(form, "class", "loginForm svelte-19a25bx");
    			add_location(form, file, 192, 8, 4359);
    			attr_dev(div4, "class", "container svelte-19a25bx");
    			add_location(div4, file, 191, 4, 4327);
    			attr_dev(div5, "class", "login svelte-19a25bx");
    			add_location(div5, file, 190, 0, 4303);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, form);
    			append_dev(form, div0);
    			append_dev(div0, h2);
    			append_dev(form, t1);
    			append_dev(form, label0);
    			append_dev(label0, div1);
    			/*div1_binding*/ ctx[5](div1);
    			append_dev(label0, t3);
    			append_dev(label0, input0);
    			append_dev(form, t4);
    			append_dev(form, label1);
    			append_dev(label1, div2);
    			/*div2_binding*/ ctx[8](div2);
    			append_dev(label1, t6);
    			append_dev(label1, input1);
    			append_dev(form, t7);
    			append_dev(form, div3);
    			append_dev(div3, button);
    			append_dev(div3, t9);
    			append_dev(div3, label2);
    			append_dev(label2, input2);
    			append_dev(label2, t10);
    			append_dev(form, t11);
    			append_dev(form, a);
    			append_dev(form, t13);
    			append_dev(form, input3);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "focus", /*focus_handler*/ ctx[6], false, false, false),
    				listen_dev(input0, "focusout", /*focusout_handler*/ ctx[7], false, false, false),
    				listen_dev(input1, "focus", /*focus_handler_1*/ ctx[9], false, false, false),
    				listen_dev(input1, "focusout", /*focusout_handler_1*/ ctx[10], false, false, false),
    				listen_dev(a, "click", /*click_handler*/ ctx[11], false, false, false),
    				listen_dev(form, "submit", /*submitForm*/ ctx[3], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$CSRF*/ 4) {
    				prop_dev(input3, "value", /*$CSRF*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			/*div1_binding*/ ctx[5](null);
    			/*div2_binding*/ ctx[8](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $CSRF;
    	validate_store(CSRF, "CSRF");
    	component_subscribe($$self, CSRF, $$value => $$invalidate(2, $CSRF = $$value));
    	let usernameLabel;
    	let passwordLabel;

    	const getUser = async () => {
    		const response = await fetch("/user", { redirect: "manual" });

    		if (response.ok) {
    			let user = await response.json();
    			USER.set(user);
    			AUTH_MODE.set("AUTHORIZED");
    			window.location.pathname = "/";
    		} else {
    			alert("Invalid login or password.");
    		}
    	};

    	async function submitForm(form) {
    		const xhr = new XMLHttpRequest();
    		const submittedForm = new FormData(form.target);
    		xhr.open("POST", "/login");
    		xhr.send(submittedForm);

    		xhr.onload = () => {
    			if (xhr.status == 200) {
    				getUser().catch(e => {
    					alert(e);
    				});
    			}
    		};

    		form.target.username.value = "";
    		form.target.password.value = "";
    		form.preventDefault();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Login", $$slots, []);

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, usernameLabel = $$value);
    		});
    	}

    	const focus_handler = () => {
    		$$invalidate(0, usernameLabel.style.color = "rgb(73, 160, 235)", usernameLabel);
    	};

    	const focusout_handler = () => {
    		$$invalidate(0, usernameLabel.style.color = "rgb(125, 138, 150)", usernameLabel);
    	};

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, passwordLabel = $$value);
    		});
    	}

    	const focus_handler_1 = () => {
    		$$invalidate(1, passwordLabel.style.color = "rgb(73, 160, 235)", passwordLabel);
    	};

    	const focusout_handler_1 = () => {
    		$$invalidate(1, passwordLabel.style.color = "rgb(125, 138, 150)", passwordLabel);
    	};

    	const click_handler = () => {
    		AUTH_MODE.set("REGISTRATION");
    	};

    	$$self.$capture_state = () => ({
    		USER,
    		AUTH_MODE,
    		CSRF,
    		usernameLabel,
    		passwordLabel,
    		getUser,
    		submitForm,
    		$CSRF
    	});

    	$$self.$inject_state = $$props => {
    		if ("usernameLabel" in $$props) $$invalidate(0, usernameLabel = $$props.usernameLabel);
    		if ("passwordLabel" in $$props) $$invalidate(1, passwordLabel = $$props.passwordLabel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		usernameLabel,
    		passwordLabel,
    		$CSRF,
    		submitForm,
    		getUser,
    		div1_binding,
    		focus_handler,
    		focusout_handler,
    		div2_binding,
    		focus_handler_1,
    		focusout_handler_1,
    		click_handler
    	];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/Validator.svelte generated by Svelte v3.20.1 */

    const LOGIN_REG_EXP = /^[a-zA-Z]\w{5,25}$/;
    const PASSWORD_REG_EXP = /^\w{8,28}$/;

    function isUsernameValid(username) {
    	return LOGIN_REG_EXP.test(username);
    }

    function isPasswordValid(password) {
    	return PASSWORD_REG_EXP.test(password);
    }

    /* src/Registration.svelte generated by Svelte v3.20.1 */
    const file$1 = "src/Registration.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (70:8) {#if errors.length !== 0}
    function create_if_block(ctx) {
    	let div;
    	let li;
    	let each_value = /*errors*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			li = element("li");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(li, "class", "svelte-16jdvua");
    			add_location(li, file$1, 71, 16, 2152);
    			attr_dev(div, "class", "errors svelte-16jdvua");
    			add_location(div, file$1, 70, 12, 2115);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, li);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(li, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errors*/ 8) {
    				each_value = /*errors*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(li, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(70:8) {#if errors.length !== 0}",
    		ctx
    	});

    	return block;
    }

    // (73:20) {#each errors as error}
    function create_each_block(ctx) {
    	let ul;
    	let t_value = /*error*/ ctx[16] + "";
    	let t;

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			t = text(t_value);
    			attr_dev(ul, "class", "svelte-16jdvua");
    			add_location(ul, file$1, 73, 24, 2225);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errors*/ 8 && t_value !== (t_value = /*error*/ ctx[16] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(73:20) {#each errors as error}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div6;
    	let div5;
    	let t0;
    	let form;
    	let div0;
    	let h2;
    	let t2;
    	let label0;
    	let div1;
    	let t4;
    	let input0;
    	let t5;
    	let label1;
    	let div2;
    	let t7;
    	let input1;
    	let t8;
    	let label2;
    	let div3;
    	let t10;
    	let input2;
    	let t11;
    	let div4;
    	let button;
    	let t13;
    	let a;
    	let t15;
    	let input3;
    	let dispose;
    	let if_block = /*errors*/ ctx[3].length !== 0 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			form = element("form");
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "please sign up";
    			t2 = space();
    			label0 = element("label");
    			div1 = element("div");
    			div1.textContent = "username";
    			t4 = space();
    			input0 = element("input");
    			t5 = space();
    			label1 = element("label");
    			div2 = element("div");
    			div2.textContent = "password";
    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			label2 = element("label");
    			div3 = element("div");
    			div3.textContent = "confirm password";
    			t10 = space();
    			input2 = element("input");
    			t11 = space();
    			div4 = element("div");
    			button = element("button");
    			button.textContent = "register";
    			t13 = space();
    			a = element("a");
    			a.textContent = "sign in";
    			t15 = space();
    			input3 = element("input");
    			attr_dev(h2, "class", "svelte-16jdvua");
    			add_location(h2, file$1, 82, 16, 2448);
    			attr_dev(div0, "class", "loginForm__title svelte-16jdvua");
    			add_location(div0, file$1, 81, 12, 2401);
    			attr_dev(div1, "class", "inputAround__text svelte-16jdvua");
    			attr_dev(div1, "name", "label-div");
    			add_location(div1, file$1, 86, 16, 2548);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "username");
    			attr_dev(input0, "name", "username");
    			attr_dev(input0, "class", "loginForm__input svelte-16jdvua");
    			input0.required = true;
    			add_location(input0, file$1, 88, 16, 2654);
    			attr_dev(label0, "class", "inputAround svelte-16jdvua");
    			add_location(label0, file$1, 85, 12, 2504);
    			attr_dev(div2, "class", "inputAround__text svelte-16jdvua");
    			attr_dev(div2, "name", "label-div");
    			add_location(div2, file$1, 102, 16, 3177);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "id", "password");
    			attr_dev(input1, "name", "password");
    			attr_dev(input1, "class", "loginForm__input svelte-16jdvua");
    			input1.required = true;
    			add_location(input1, file$1, 104, 16, 3283);
    			attr_dev(label1, "class", "inputAround svelte-16jdvua");
    			add_location(label1, file$1, 101, 12, 3133);
    			attr_dev(div3, "class", "inputAround__text svelte-16jdvua");
    			attr_dev(div3, "name", "label-div");
    			add_location(div3, file$1, 119, 16, 3811);
    			attr_dev(input2, "type", "password");
    			attr_dev(input2, "id", "confirmPassword");
    			attr_dev(input2, "name", "confirmPassword");
    			attr_dev(input2, "class", "loginForm__input svelte-16jdvua");
    			input2.required = true;
    			add_location(input2, file$1, 121, 16, 3932);
    			attr_dev(label2, "class", "inputAround svelte-16jdvua");
    			add_location(label2, file$1, 118, 12, 3767);
    			attr_dev(button, "class", "loginForm__submitButton svelte-16jdvua");
    			attr_dev(button, "type", "button");
    			add_location(button, file$1, 136, 16, 4496);
    			attr_dev(div4, "class", "loginForm__buttonArea svelte-16jdvua");
    			add_location(div4, file$1, 135, 12, 4444);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "loginLink svelte-16jdvua");
    			add_location(a, file$1, 138, 12, 4621);
    			attr_dev(input3, "id", "_csrf");
    			attr_dev(input3, "name", "_csrf");
    			attr_dev(input3, "type", "hidden");
    			input3.value = /*$CSRF*/ ctx[4];
    			add_location(input3, file$1, 142, 12, 4727);
    			attr_dev(form, "class", "registrationForm svelte-16jdvua");
    			attr_dev(form, "id", "registrationFrom");
    			add_location(form, file$1, 80, 8, 2335);
    			attr_dev(div5, "class", "container svelte-16jdvua");
    			add_location(div5, file$1, 68, 4, 2045);
    			attr_dev(div6, "class", "registration svelte-16jdvua");
    			add_location(div6, file$1, 67, 0, 2014);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			if (if_block) if_block.m(div5, null);
    			append_dev(div5, t0);
    			append_dev(div5, form);
    			append_dev(form, div0);
    			append_dev(div0, h2);
    			append_dev(form, t2);
    			append_dev(form, label0);
    			append_dev(label0, div1);
    			/*div1_binding*/ ctx[6](div1);
    			append_dev(label0, t4);
    			append_dev(label0, input0);
    			append_dev(form, t5);
    			append_dev(form, label1);
    			append_dev(label1, div2);
    			/*div2_binding*/ ctx[9](div2);
    			append_dev(label1, t7);
    			append_dev(label1, input1);
    			append_dev(form, t8);
    			append_dev(form, label2);
    			append_dev(label2, div3);
    			/*div3_binding*/ ctx[12](div3);
    			append_dev(label2, t10);
    			append_dev(label2, input2);
    			append_dev(form, t11);
    			append_dev(form, div4);
    			append_dev(div4, button);
    			append_dev(form, t13);
    			append_dev(form, a);
    			append_dev(form, t15);
    			append_dev(form, input3);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "focus", /*focus_handler*/ ctx[7], false, false, false),
    				listen_dev(input0, "focusout", /*focusout_handler*/ ctx[8], false, false, false),
    				listen_dev(input1, "focus", /*focus_handler_1*/ ctx[10], false, false, false),
    				listen_dev(input1, "focusout", /*focusout_handler_1*/ ctx[11], false, false, false),
    				listen_dev(input2, "focus", /*focus_handler_2*/ ctx[13], false, false, false),
    				listen_dev(input2, "focusout", /*focusout_handler_2*/ ctx[14], false, false, false),
    				listen_dev(button, "click", /*submitForm*/ ctx[5], false, false, false),
    				listen_dev(a, "click", /*click_handler*/ ctx[15], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*errors*/ ctx[3].length !== 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div5, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$CSRF*/ 16) {
    				prop_dev(input3, "value", /*$CSRF*/ ctx[4]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			if (if_block) if_block.d();
    			/*div1_binding*/ ctx[6](null);
    			/*div2_binding*/ ctx[9](null);
    			/*div3_binding*/ ctx[12](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $CSRF;
    	validate_store(CSRF, "CSRF");
    	component_subscribe($$self, CSRF, $$value => $$invalidate(4, $CSRF = $$value));
    	let usernameLabel;
    	let passwordLabel;
    	let confirmPasswordLabel;
    	let errors = [];

    	async function submitForm(frm) {
    		const form = document.querySelector("#registrationFrom");
    		$$invalidate(3, errors = Array(0));
    		const username = form.username.value;
    		const password = form.password.value;
    		const confirmPassword = form.confirmPassword.value;
    		const VALID = (confirmPassword === password) * isUsernameValid(username) * isPasswordValid(password);

    		if (VALID) {
    			const user = { username, password, userRole: null };

    			let response = await fetch("/registration", {
    				method: "POST",
    				headers: {
    					"Content-Type": "application/json;charset=utf-8",
    					"X-XSRF-TOKEN": $CSRF
    				},
    				body: JSON.stringify(user)
    			});

    			if (response.ok) {
    				const userWasAdded = await response.text();

    				if (userWasAdded === "true") {
    					AUTH_MODE.set("LOGIN");
    					window.location.pathname = "/";
    				} else {
    					errors.push("user with that username already exists");
    				}
    			} else {
    				errors.push("server not found");
    			}
    		} else {
    			if (!isUsernameValid(username)) {
    				errors.push("invalid username");
    			}

    			if (confirmPassword !== password) {
    				errors.push("password mismatch");
    			} else if (!isPasswordValid(password)) {
    				errors.push("invalid password");
    			}
    		}

    		form.password.value = "";
    		form.confirmPassword.value = "";
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Registration> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Registration", $$slots, []);

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, usernameLabel = $$value);
    		});
    	}

    	const focus_handler = () => {
    		$$invalidate(0, usernameLabel.style.color = "rgb(73, 160, 235)", usernameLabel);
    	};

    	const focusout_handler = () => {
    		$$invalidate(0, usernameLabel.style.color = "rgb(125, 138, 150)", usernameLabel);
    	};

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, passwordLabel = $$value);
    		});
    	}

    	const focus_handler_1 = () => {
    		$$invalidate(1, passwordLabel.style.color = "rgb(73, 160, 235)", passwordLabel);
    	};

    	const focusout_handler_1 = () => {
    		$$invalidate(1, passwordLabel.style.color = "rgb(125, 138, 150)", passwordLabel);
    	};

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, confirmPasswordLabel = $$value);
    		});
    	}

    	const focus_handler_2 = () => {
    		$$invalidate(2, confirmPasswordLabel.style.color = "rgb(73, 160, 235)", confirmPasswordLabel);
    	};

    	const focusout_handler_2 = () => {
    		$$invalidate(2, confirmPasswordLabel.style.color = "rgb(125, 138, 150)", confirmPasswordLabel);
    	};

    	const click_handler = () => {
    		AUTH_MODE.set("LOGIN");
    	};

    	$$self.$capture_state = () => ({
    		AUTH_MODE,
    		CSRF,
    		isUsernameValid,
    		isPasswordValid,
    		usernameLabel,
    		passwordLabel,
    		confirmPasswordLabel,
    		errors,
    		submitForm,
    		$CSRF
    	});

    	$$self.$inject_state = $$props => {
    		if ("usernameLabel" in $$props) $$invalidate(0, usernameLabel = $$props.usernameLabel);
    		if ("passwordLabel" in $$props) $$invalidate(1, passwordLabel = $$props.passwordLabel);
    		if ("confirmPasswordLabel" in $$props) $$invalidate(2, confirmPasswordLabel = $$props.confirmPasswordLabel);
    		if ("errors" in $$props) $$invalidate(3, errors = $$props.errors);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		usernameLabel,
    		passwordLabel,
    		confirmPasswordLabel,
    		errors,
    		$CSRF,
    		submitForm,
    		div1_binding,
    		focus_handler,
    		focusout_handler,
    		div2_binding,
    		focus_handler_1,
    		focusout_handler_1,
    		div3_binding,
    		focus_handler_2,
    		focusout_handler_2,
    		click_handler
    	];
    }

    class Registration extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Registration",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/ControlPane.svelte generated by Svelte v3.20.1 */
    const file$2 = "src/ControlPane.svelte";

    function create_fragment$2(ctx) {
    	let div12;
    	let div5;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div4;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let div3;
    	let t7;
    	let div10;
    	let div6;
    	let t9;
    	let div7;
    	let t11;
    	let div8;
    	let t13;
    	let div9;
    	let t15;
    	let div11;
    	let dispose;

    	const block = {
    		c: function create() {
    			div12 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div4 = element("div");
    			div1 = element("div");
    			div1.textContent = `@${/*login*/ ctx[2]}`;
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = `${/*name*/ ctx[0]}`;
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = `${/*surname*/ ctx[1]}`;
    			t7 = space();
    			div10 = element("div");
    			div6 = element("div");
    			div6.textContent = "Выходящие";
    			t9 = space();
    			div7 = element("div");
    			div7.textContent = "Сегодня";
    			t11 = space();
    			div8 = element("div");
    			div8.textContent = "На неделе";
    			t13 = space();
    			div9 = element("div");
    			div9.textContent = "Позже";
    			t15 = space();
    			div11 = element("div");
    			div11.textContent = "logout";
    			attr_dev(img, "id", "personalPicture");
    			if (img.src !== (img_src_value = "../image/m1000x1000.jpeg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-wy3gzc");
    			add_location(img, file$2, 117, 12, 2246);
    			attr_dev(div0, "class", "imageBlock svelte-wy3gzc");
    			add_location(div0, file$2, 116, 8, 2209);
    			attr_dev(div1, "class", "login svelte-wy3gzc");
    			add_location(div1, file$2, 120, 12, 2364);
    			attr_dev(div2, "class", "name");
    			add_location(div2, file$2, 121, 12, 2410);
    			attr_dev(div3, "class", "surname");
    			add_location(div3, file$2, 122, 12, 2453);
    			attr_dev(div4, "class", "infoBlock svelte-wy3gzc");
    			add_location(div4, file$2, 119, 8, 2328);
    			attr_dev(div5, "class", "personalPart svelte-wy3gzc");
    			add_location(div5, file$2, 115, 4, 2174);
    			attr_dev(div6, "class", "inbox boxButton svelte-wy3gzc");
    			add_location(div6, file$2, 127, 8, 2553);
    			attr_dev(div7, "class", "boxButton svelte-wy3gzc");
    			add_location(div7, file$2, 128, 8, 2606);
    			attr_dev(div8, "class", "boxButton svelte-wy3gzc");
    			add_location(div8, file$2, 129, 8, 2651);
    			attr_dev(div9, "class", "boxButton svelte-wy3gzc");
    			add_location(div9, file$2, 130, 8, 2698);
    			attr_dev(div10, "class", "boxesPart svelte-wy3gzc");
    			add_location(div10, file$2, 126, 4, 2521);
    			attr_dev(div11, "class", "logoutButton svelte-wy3gzc");
    			add_location(div11, file$2, 133, 4, 2749);
    			attr_dev(div12, "class", "content svelte-wy3gzc");
    			add_location(div12, file$2, 114, 0, 2148);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div5);
    			append_dev(div5, div0);
    			append_dev(div0, img);
    			append_dev(div5, t0);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			append_dev(div12, t7);
    			append_dev(div12, div10);
    			append_dev(div10, div6);
    			append_dev(div10, t9);
    			append_dev(div10, div7);
    			append_dev(div10, t11);
    			append_dev(div10, div8);
    			append_dev(div10, t13);
    			append_dev(div10, div9);
    			append_dev(div12, t15);
    			append_dev(div12, div11);
    			if (remount) dispose();
    			dispose = listen_dev(div11, "click", /*logout*/ ctx[3], false, false, false);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div12);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $CSRF;
    	validate_store(CSRF, "CSRF");
    	component_subscribe($$self, CSRF, $$value => $$invalidate(4, $CSRF = $$value));
    	let name = "Молодой";
    	let surname = "Платон";
    	let login = "molodoy2003";

    	async function logout() {
    		const logoutFunc = await fetch("/logout", {
    			method: "POST",
    			redirect: "/",
    			headers: {
    				"Content-Type": "application/json;charset=utf-8",
    				"X-XSRF-TOKEN": $CSRF
    			}
    		});

    		if (logoutFunc.ok) {
    			await AUTH_MODE.set("LOGIN");
    		}
    	}

    	
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ControlPane> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ControlPane", $$slots, []);

    	$$self.$capture_state = () => ({
    		CSRF,
    		AUTH_MODE,
    		USER,
    		name,
    		surname,
    		login,
    		logout,
    		$CSRF
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("surname" in $$props) $$invalidate(1, surname = $$props.surname);
    		if ("login" in $$props) $$invalidate(2, login = $$props.login);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, surname, login, logout];
    }

    class ControlPane extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ControlPane",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/AddTaskPane.svelte generated by Svelte v3.20.1 */

    const file$3 = "src/AddTaskPane.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let label0;
    	let t1;
    	let input;
    	let t2;
    	let label1;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label0 = element("label");
    			label0.textContent = ">";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			label1 = element("label");
    			label1.textContent = "#add";
    			attr_dev(label0, "id", "arrowLabel");
    			attr_dev(label0, "class", "svelte-ybu00q");
    			add_location(label0, file$3, 83, 4, 1886);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "spellcheck", "false");
    			attr_dev(input, "placeholder", "Добавить новую задача");
    			attr_dev(input, "class", "svelte-ybu00q");
    			add_location(input, file$3, 84, 4, 1946);
    			attr_dev(label1, "id", "addLabel");
    			attr_dev(label1, "class", "svelte-ybu00q");
    			add_location(label1, file$3, 93, 4, 2233);
    			attr_dev(div, "class", "addTaskBlock svelte-ybu00q");
    			add_location(div, file$3, 82, 0, 1830);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label0);
    			/*label0_binding*/ ctx[8](label0);
    			append_dev(div, t1);
    			append_dev(div, input);
    			/*input_binding*/ ctx[9](input);
    			append_dev(div, t2);
    			append_dev(div, label1);
    			/*label1_binding*/ ctx[10](label1);
    			/*div_binding*/ ctx[11](div);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input, "keypress", /*enterEvent*/ ctx[4], false, false, false),
    				listen_dev(input, "focus", /*focusInputFieldEvent*/ ctx[6], false, false, false),
    				listen_dev(input, "focusout", /*focusoutInputFieldEvent*/ ctx[7], false, false, false),
    				listen_dev(label1, "click", /*addTaskFromField*/ ctx[5], false, false, false)
    			];
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*label0_binding*/ ctx[8](null);
    			/*input_binding*/ ctx[9](null);
    			/*label1_binding*/ ctx[10](null);
    			/*div_binding*/ ctx[11](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let addTaskBlock;
    	let arrowLabel;
    	let addLabel;
    	let inputField;

    	function enterEvent(field) {
    		if (field.keyCode !== 13) {
    			return;
    		}

    		addTaskFromField();
    	}

    	function addTaskFromField() {
    		if (!inputField.value.trim()) {
    			$$invalidate(3, inputField.value = "", inputField);
    			return;
    		}

    		$$invalidate(3, inputField.value = "", inputField);
    	}

    	function focusInputFieldEvent() {
    		$$invalidate(0, addTaskBlock.style.borderColor = "rgb(73, 160, 235)", addTaskBlock);
    		$$invalidate(1, arrowLabel.style.color = "rgb(73, 160, 235)", arrowLabel);
    		$$invalidate(2, addLabel.style.color = "rgb(123, 177, 70)", addLabel);
    	}

    	function focusoutInputFieldEvent() {
    		$$invalidate(0, addTaskBlock.style.borderColor = "rgb(125, 138, 150)", addTaskBlock);
    		$$invalidate(1, arrowLabel.style.color = "rgb(125, 138, 150)", arrowLabel);
    		$$invalidate(2, addLabel.style.color = "rgb(125, 138, 150)", addLabel);
    		$$invalidate(2, addLabel.style.textShadow = "none", addLabel);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AddTaskPane> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AddTaskPane", $$slots, []);

    	function label0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, arrowLabel = $$value);
    		});
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(3, inputField = $$value);
    		});
    	}

    	function label1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, addLabel = $$value);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, addTaskBlock = $$value);
    		});
    	}

    	$$self.$capture_state = () => ({
    		addTaskBlock,
    		arrowLabel,
    		addLabel,
    		inputField,
    		enterEvent,
    		addTaskFromField,
    		focusInputFieldEvent,
    		focusoutInputFieldEvent
    	});

    	$$self.$inject_state = $$props => {
    		if ("addTaskBlock" in $$props) $$invalidate(0, addTaskBlock = $$props.addTaskBlock);
    		if ("arrowLabel" in $$props) $$invalidate(1, arrowLabel = $$props.arrowLabel);
    		if ("addLabel" in $$props) $$invalidate(2, addLabel = $$props.addLabel);
    		if ("inputField" in $$props) $$invalidate(3, inputField = $$props.inputField);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		addTaskBlock,
    		arrowLabel,
    		addLabel,
    		inputField,
    		enterEvent,
    		addTaskFromField,
    		focusInputFieldEvent,
    		focusoutInputFieldEvent,
    		label0_binding,
    		input_binding,
    		label1_binding,
    		div_binding
    	];
    }

    class AddTaskPane extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddTaskPane",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Checkbox.svelte generated by Svelte v3.20.1 */

    const file$4 = "src/Checkbox.svelte";

    function create_fragment$4(ctx) {
    	let input;
    	let input_id_value;
    	let t;
    	let label;
    	let label_for_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t = space();
    			label = element("label");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "id", input_id_value = "task-" + /*id*/ ctx[0]);
    			attr_dev(input, "class", "css-checkbox svelte-l9citf");
    			add_location(input, file$4, 69, 0, 1640);
    			attr_dev(label, "for", label_for_value = "task-" + /*id*/ ctx[0]);
    			attr_dev(label, "class", "css-label svelte-l9citf");
    			add_location(label, file$4, 75, 0, 1759);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, label, anchor);
    			if (remount) dispose();

    			dispose = listen_dev(
    				input,
    				"click",
    				function () {
    					if (is_function(/*completeEvent*/ ctx[1])) /*completeEvent*/ ctx[1].apply(this, arguments);
    				},
    				false,
    				false,
    				false
    			);
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*id*/ 1 && input_id_value !== (input_id_value = "task-" + /*id*/ ctx[0])) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*id*/ 1 && label_for_value !== (label_for_value = "task-" + /*id*/ ctx[0])) {
    				attr_dev(label, "for", label_for_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(label);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { id } = $$props;
    	let { onCheck } = $$props;
    	let { completeEvent } = $$props;
    	const writable_props = ["id", "onCheck", "completeEvent"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Checkbox> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Checkbox", $$slots, []);

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("onCheck" in $$props) $$invalidate(2, onCheck = $$props.onCheck);
    		if ("completeEvent" in $$props) $$invalidate(1, completeEvent = $$props.completeEvent);
    	};

    	$$self.$capture_state = () => ({ id, onCheck, completeEvent });

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("onCheck" in $$props) $$invalidate(2, onCheck = $$props.onCheck);
    		if ("completeEvent" in $$props) $$invalidate(1, completeEvent = $$props.completeEvent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [id, completeEvent, onCheck];
    }

    class Checkbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { id: 0, onCheck: 2, completeEvent: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Checkbox",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<Checkbox> was created without expected prop 'id'");
    		}

    		if (/*onCheck*/ ctx[2] === undefined && !("onCheck" in props)) {
    			console.warn("<Checkbox> was created without expected prop 'onCheck'");
    		}

    		if (/*completeEvent*/ ctx[1] === undefined && !("completeEvent" in props)) {
    			console.warn("<Checkbox> was created without expected prop 'completeEvent'");
    		}
    	}

    	get id() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onCheck() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onCheck(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get completeEvent() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set completeEvent(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/TaskBlock.svelte generated by Svelte v3.20.1 */
    const file$5 = "src/TaskBlock.svelte";

    function create_fragment$5(ctx) {
    	let div2;
    	let t0;
    	let div1;
    	let div0;
    	let t1;
    	let current;
    	let dispose;

    	const checkbox = new Checkbox({
    			props: {
    				completeEvent: /*completeTaskEvent*/ ctx[4],
    				id: /*id*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			create_component(checkbox.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t1 = text(/*statement*/ ctx[1]);
    			attr_dev(div0, "class", "statementField svelte-1ldcfnm");
    			attr_dev(div0, "contenteditable", "true");
    			attr_dev(div0, "type", "text");
    			attr_dev(div0, "spellcheck", "false");
    			attr_dev(div0, "onautocomplete", "false");
    			add_location(div0, file$5, 105, 8, 2308);
    			attr_dev(div1, "class", "taskBlock svelte-1ldcfnm");
    			add_location(div1, file$5, 102, 4, 2235);
    			attr_dev(div2, "class", "content svelte-1ldcfnm");
    			add_location(div2, file$5, 97, 0, 2102);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div2, anchor);
    			mount_component(checkbox, div2, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			/*div0_binding*/ ctx[11](div0);
    			/*div2_binding*/ ctx[12](div2);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(div0, "keypress", /*keyPress*/ ctx[5], false, false, false),
    				listen_dev(div0, "focus", /*saveText*/ ctx[6], false, false, false),
    				listen_dev(div0, "focusout", /*checkIfNotEmpty*/ ctx[7], false, false, false),
    				listen_dev(div0, "paste", pasteText, false, false, false),
    				listen_dev(div1, "click", /*setInputFocused*/ ctx[8], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			const checkbox_changes = {};
    			if (dirty & /*id*/ 1) checkbox_changes.id = /*id*/ ctx[0];
    			checkbox.$set(checkbox_changes);
    			if (!current || dirty & /*statement*/ 2) set_data_dev(t1, /*statement*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(checkbox);
    			/*div0_binding*/ ctx[11](null);
    			/*div2_binding*/ ctx[12](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function pasteText(field) {
    	const text = field.clipboardData.getData("text");
    	document.execCommand("insertHTML", false, text);
    	field.preventDefault();
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { id } = $$props;
    	let { statement } = $$props;
    	let content;
    	let statementField;
    	let statementBeforeChanging;
    	let statementAfterChanging;

    	function completeTaskEvent(task) {
    		if (!task.target.checked) {
    			$$invalidate(3, statementField.style.color = "white", statementField);
    			$$invalidate(3, statementField.style.textDecoration = "none", statementField);
    		} else {
    			$$invalidate(3, statementField.style.color = "rgb(58, 68, 76)", statementField);
    			$$invalidate(3, statementField.style.textDecoration = "line-through", statementField);
    		}
    	}

    	function keyPress(field) {
    		if (field.keyCode === 13) {
    			field.target.blur();
    			statementField.preventDefault();
    		}
    	}

    	function saveText(field) {
    		statementBeforeChanging = field.target.textContent.trim();
    	}

    	function checkIfNotEmpty(field) {
    		statementAfterChanging = field.target.textContent.trim();

    		if (statementAfterChanging.length === 0) {
    			field.target.textContent = statementBeforeChanging;
    		}
    	}

    	function setInputFocused() {
    		statementField.focus();
    	}

    	const writable_props = ["id", "statement"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TaskBlock> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TaskBlock", $$slots, []);

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(3, statementField = $$value);
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, content = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("statement" in $$props) $$invalidate(1, statement = $$props.statement);
    	};

    	$$self.$capture_state = () => ({
    		Checkbox,
    		onMount,
    		id,
    		statement,
    		content,
    		statementField,
    		statementBeforeChanging,
    		statementAfterChanging,
    		completeTaskEvent,
    		keyPress,
    		pasteText,
    		saveText,
    		checkIfNotEmpty,
    		setInputFocused
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("statement" in $$props) $$invalidate(1, statement = $$props.statement);
    		if ("content" in $$props) $$invalidate(2, content = $$props.content);
    		if ("statementField" in $$props) $$invalidate(3, statementField = $$props.statementField);
    		if ("statementBeforeChanging" in $$props) statementBeforeChanging = $$props.statementBeforeChanging;
    		if ("statementAfterChanging" in $$props) statementAfterChanging = $$props.statementAfterChanging;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		id,
    		statement,
    		content,
    		statementField,
    		completeTaskEvent,
    		keyPress,
    		saveText,
    		checkIfNotEmpty,
    		setInputFocused,
    		statementBeforeChanging,
    		statementAfterChanging,
    		div0_binding,
    		div2_binding
    	];
    }

    class TaskBlock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { id: 0, statement: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TaskBlock",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<TaskBlock> was created without expected prop 'id'");
    		}

    		if (/*statement*/ ctx[1] === undefined && !("statement" in props)) {
    			console.warn("<TaskBlock> was created without expected prop 'statement'");
    		}
    	}

    	get id() {
    		throw new Error("<TaskBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TaskBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get statement() {
    		throw new Error("<TaskBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set statement(value) {
    		throw new Error("<TaskBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ActualTaskPane.svelte generated by Svelte v3.20.1 */
    const file$6 = "src/ActualTaskPane.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (42:4) {#each tasks as task}
    function create_each_block$1(ctx) {
    	let current;

    	const taskblock = new TaskBlock({
    			props: {
    				id: /*task*/ ctx[1].id,
    				statement: /*task*/ ctx[1].statement
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(taskblock.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(taskblock, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(taskblock.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(taskblock.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(taskblock, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(42:4) {#each tasks as task}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let current;
    	let each_value = /*tasks*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "taskPane svelte-9nnqe7");
    			add_location(div, file$6, 40, 0, 714);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tasks*/ 1) {
    				each_value = /*tasks*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const tasks = [
    		{
    			id: 1,
    			statement: "Купить игрушку дьяволы"
    		},
    		{
    			id: 2,
    			statement: "Научить енота пользоваться телевизором"
    		},
    		{
    			id: 3,
    			statement: "Позвонить Максу Дорофееву"
    		},
    		{
    			id: 4,
    			statement: "Научить маму пользоваться девтулзами"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ActualTaskPane> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ActualTaskPane", $$slots, []);
    	$$self.$capture_state = () => ({ TaskBlock, tasks });
    	return [tasks];
    }

    class ActualTaskPane extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ActualTaskPane",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/Application.svelte generated by Svelte v3.20.1 */
    const file$7 = "src/Application.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let header;
    	let t0;
    	let main;
    	let t1;
    	let current;
    	const controlpane = new ControlPane({ $$inline: true });
    	const addtaskpane = new AddTaskPane({ $$inline: true });
    	const actualtaskpane = new ActualTaskPane({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			header = element("header");
    			create_component(controlpane.$$.fragment);
    			t0 = space();
    			main = element("main");
    			create_component(addtaskpane.$$.fragment);
    			t1 = space();
    			create_component(actualtaskpane.$$.fragment);
    			attr_dev(header, "class", "svelte-1qv7jff");
    			add_location(header, file$7, 34, 4, 681);
    			attr_dev(main, "class", "svelte-1qv7jff");
    			add_location(main, file$7, 37, 4, 731);
    			attr_dev(div, "class", "app svelte-1qv7jff");
    			add_location(div, file$7, 33, 0, 659);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, header);
    			mount_component(controlpane, header, null);
    			append_dev(div, t0);
    			append_dev(div, main);
    			mount_component(addtaskpane, main, null);
    			append_dev(main, t1);
    			mount_component(actualtaskpane, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(controlpane.$$.fragment, local);
    			transition_in(addtaskpane.$$.fragment, local);
    			transition_in(actualtaskpane.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(controlpane.$$.fragment, local);
    			transition_out(addtaskpane.$$.fragment, local);
    			transition_out(actualtaskpane.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(controlpane);
    			destroy_component(addtaskpane);
    			destroy_component(actualtaskpane);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Application> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Application", $$slots, []);
    	$$self.$capture_state = () => ({ ControlPane, AddTaskPane, ActualTaskPane });
    	return [];
    }

    class Application extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Application",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/Utils.svelte generated by Svelte v3.20.1 */

    function getCookie(cname) {
    	let name = cname + "=";
    	let decodedCookie = decodeURIComponent(document.cookie);
    	let ca = decodedCookie.split(";");

    	for (let i = 0; i < ca.length; i++) {
    		let c = ca[i];

    		while (c.charAt(0) == " ") {
    			c = c.substring(1);
    		}

    		if (c.indexOf(name) == 0) {
    			return c.substring(name.length, c.length);
    		}
    	}

    	return "";
    }

    /* src/App.svelte generated by Svelte v3.20.1 */

    // (52:38) 
    function create_if_block_2(ctx) {
    	let current;
    	const application = new Application({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(application.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(application, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(application.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(application.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(application, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(52:38) ",
    		ctx
    	});

    	return block;
    }

    // (50:40) 
    function create_if_block_1(ctx) {
    	let current;
    	const registration = new Registration({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(registration.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(registration, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(registration.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(registration.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(registration, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(50:40) ",
    		ctx
    	});

    	return block;
    }

    // (48:0) {#if $AUTH_MODE === 'LOGIN'}
    function create_if_block$1(ctx) {
    	let current;
    	const login = new Login({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(login.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(login, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(login, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(48:0) {#if $AUTH_MODE === 'LOGIN'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_if_block_1, create_if_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$AUTH_MODE*/ ctx[0] === "LOGIN") return 0;
    		if (/*$AUTH_MODE*/ ctx[0] === "REGISTRATION") return 1;
    		if (/*$AUTH_MODE*/ ctx[0] === "AUTHORIZED") return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function saveCookies() {
    	const session = getCookie("JSESSIONID");
    	const csrf = getCookie("XSRF-TOKEN");
    	SESSIONID.set(session);
    	CSRF.set(csrf);
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $AUTH_MODE;
    	validate_store(AUTH_MODE, "AUTH_MODE");
    	component_subscribe($$self, AUTH_MODE, $$value => $$invalidate(0, $AUTH_MODE = $$value));

    	onMount(async () => {
    		const response = await fetch("/user", { redirect: "manual" });

    		if (response.ok) {
    			let user = await response.json();
    			await USER.set(user);
    			await AUTH_MODE.set("AUTHORIZED");
    		}
    	});

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
    	AUTH_MODE.set("AUTHORIZED");

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		onMount,
    		SESSIONID,
    		CSRF,
    		USER,
    		AUTH_MODE,
    		Login,
    		Registration,
    		Application,
    		getCookie,
    		saveCookies,
    		$AUTH_MODE
    	});

    	return [$AUTH_MODE];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

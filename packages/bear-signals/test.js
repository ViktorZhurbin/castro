import { createSignal, createEffect } from './lib/index.js';

console.log('=== Test 1: Basic reactivity ===');
const [count, setCount] = createSignal(0);

createEffect(() => {
	console.log(`Count is: ${count()}`);
});

console.log('\nUpdating count to 5...');
setCount(5);

console.log('\nUpdating count to 10...');
setCount(10);

console.log('\n=== Test 2: Multiple signals ===');
const [firstName, setFirstName] = createSignal('Alice');
const [lastName, setLastName] = createSignal('Smith');

createEffect(() => {
	console.log(`Full name: ${firstName()} ${lastName()}`);
});

console.log('\nChanging first name...');
setFirstName('Bob');

console.log('\nChanging last name...');
setLastName('Jones');

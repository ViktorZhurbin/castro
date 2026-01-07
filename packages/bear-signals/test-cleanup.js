import { createSignal, createEffect } from './lib/index.js';

console.log('=== Test: Conditional dependency (shows cleanup problem) ===\n');

const [showDetails, setShowDetails] = createSignal(true);
const [userName, setUserName] = createSignal('Alice');
const [guestCount, setGuestCount] = createSignal(0);

let runCount = 0;

createEffect(() => {
	runCount++;
	if (showDetails()) {
		console.log(`[Run #${runCount}] Logged in: ${userName()}`);
	} else {
		console.log(`[Run #${runCount}] Guest #${guestCount()}`);
	}
});

console.log('\n--- Switching to guest mode ---');
setShowDetails(false);

console.log('\n--- Updating userName (should NOT trigger effect!) ---');
setUserName('Bob');
console.log('^ BUG: Effect ran even though userName is not being read!');

console.log('\n--- Updating guestCount (should trigger) ---');
setGuestCount(5);

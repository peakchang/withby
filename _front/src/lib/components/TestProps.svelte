<script>
    let { inflate, deflate } = $props();
    let power = $state(5);
</script>

<button onclick={inflate}> inflate </button>
<button onclick={() => deflate(power)}> deflate </button>
<button onclick={() => power--}>-</button>
Pump power: {power}
<button onclick={() => power++}>+</button>

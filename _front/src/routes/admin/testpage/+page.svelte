<script>
    import { goto, invalidateAll } from "$app/navigation";

    let { data } = $props();

    
    let users = $state(data.user_datas);
    let pageArr = $derived(data.pageArr);
    let nowPage = $state(1);


    $effect(() => {
        users = data.user_datas
    });

    function changChk() {
        users[0]["user_email"] = "gaildfjglijgierjg";
    }
</script>

<button on:click={changChk}>gogogo</button>
{#each users as user, idx}
    <div class="flex">
        <div class="flex justify-center items-center">
            <input type="checkbox" value={users[idx]["id"]} class="checkbox" />
        </div>
        <div>
            <input
                type="text"
                class="input-base"
                bind:value={user.user_email}
            />
        </div>
    </div>
{/each}

{#each pageArr as page}
    <input
        class="join-item btn w-10 min-h-10 h-10 checked:!bg-blue-500 checked:border-none"
        type="radio"
        name="options"
        checked={nowPage == page}
        value={page}
        aria-label={page}
        on:click={(e) => {
            goto(`?page=${e.target.value}`, { invalidateAll: true });
            nowPage = e.target.value;
        }}
    />
{/each}

<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { setParams } from "$src/lib/lib.js";
    import moment from "moment";

    let { data } = $props();
    let siteCountInfoList = $state([]);
    let dateArr = $state([]);
    let pages = $state([]);
    let nowPage = $state(0);
    let allPageCount = $state(0);

    // 검색 관련!!
    let startDate = $state(moment.utc().subtract(4, "days").format("YYYY-MM-DD"));
    let endDate = $state(moment.utc().format("YYYY-MM-DD"));
    let seachVal = $state("");

    $effect(() => {
        dateArr = data.dateArr;
        pages = data.pageList;
        siteCountInfoList = data.site_count_info_list;
        nowPage = $page.url.searchParams.get("page") || 1;
        allPageCount = data.allPageCount;
    });

    function searchSubmit(e) {
        e.preventDefault();

        const option = { sd: startDate, ed: endDate };
        if (seachVal) {
            option.search = seachVal;
        }
        setParams(option, true);
    }

    function movePage() {
        let setPage = 0;
        if (this.value == "prev") {
            setPage = nowPage - 1;
            if (setPage < 1) {
                alert("처음 페이지 입니다.");
                return;
            }
        } else if (this.value == "next") {
            setPage = Number(nowPage) + 1;
            if (setPage > allPageCount) {
                alert("마지막 페이지 입니다.");
                return;
            }
        } else if (this.value == "first_page") {
            setPage = 1;
        } else if (this.value == "last_page") {
            setPage = allPageCount;
        } else {
            setPage = parseInt(this.value);
        }

        setParams({ page: setPage });
    }
</script>

<div class="w-full">
    <form on:submit={searchSubmit}>
        <div class="flex items-center gap-1">
            <input
                type="date"
                class="border px-2 py-1 rounded-md"
                bind:value={startDate}
            />
            <span class="">~</span>
            <input
                type="date"
                class="border px-2 py-1 rounded-md"
                bind:value={endDate}
            />

            <input
                type="text"
                class="input input-bordered w-full max-w-[200px] input-sm"
                bind:value={seachVal}
            />

            <button class="btn btn-success btn-sm text-white"> 검색 </button>
        </div>
    </form>

    <div class="table-wrapper">
        <div
            class="w-full h-[630px] max-w-[1920px] overflow-auto mt-3"
            style="max-height: 700px;"
        >
            <table
                class="w-full text-sm text-center"
                style="table-layout: auto;"
            >
                <thead>
                    <tr>
                        <th
                            class="border px-2 py-1.5 sticky-header sticky-left"
                            style="white-space: nowrap;"
                        >
                            현장명
                        </th>
                        <th
                            class="border px-2 py-1.5 sticky-header"
                            style="white-space: nowrap;">총계</th
                        >

                        {#each dateArr as date}
                            <th
                                class="border px-2 py-1.5 sticky-header"
                                style="white-space: nowrap;"
                            >
                                {date}
                            </th>
                        {/each}
                    </tr>
                </thead>

                <tbody>
                    {#each siteCountInfoList as siteCountInfo}
                        <tr>
                            <td
                                class="border px-2 sticky-left"
                                style="white-space: nowrap;"
                            >
                                <div class="py-2">
                                    {siteCountInfo.form_name}
                                </div>
                            </td>
                            <td class="border" style="white-space: nowrap;">
                                {#if siteCountInfo.all_count == 0}
                                    <div class="py-2 bg-red-200">
                                        {siteCountInfo.all_count}
                                    </div>
                                {:else}
                                    <div class="py-2">
                                        {siteCountInfo.all_count}
                                    </div>
                                {/if}
                            </td>

                            {#each dateArr as date, idx}
                                <td class="border" style="white-space: nowrap;">
                                    {#if siteCountInfo.db_list.length > 0}
                                        {#each siteCountInfo.db_list as db_list, idx}
                                            {#if db_list.date == date}
                                                <div class="py-2">
                                                    {db_list.count}
                                                </div>
                                            {:else if !siteCountInfo.db_list.some((obj) => obj.date == date)}
                                                <!-- siteCountInfo.db_list 갯수만큼 도니까 마지막 값에만 1 나오게! -->
                                                {#if siteCountInfo.db_list.length - 1 == idx}
                                                    <div
                                                        class=" bg-gray-200 py-2"
                                                    >
                                                        0
                                                    </div>
                                                {/if}
                                            {/if}
                                        {/each}
                                    {:else}
                                        <div class=" bg-gray-200 py-2">0</div>
                                    {/if}
                                </td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>

    <div class="flex justify-center items-center my-5 gap-1">
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button
            class="page-btn w-8 h-8 text-sm border rounded-md"
            value="first_page"
            on:click={movePage}
        >
            <i class="fa fa-angle-double-left" aria-hidden="true"></i>
        </button>
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button
            class="page-btn w-8 h-8 text-sm border rounded-md"
            value="prev"
            on:click={movePage}
        >
            <i class="fa fa-angle-left" aria-hidden="true"></i>
        </button>
        {#each pages as page}
            {#if nowPage == page}
                <button
                    class="page-btn w-8 h-8 text-sm border rounded-md border-orange-400 bg-orange-400 text-white"
                >
                    {page}
                </button>
            {:else}
                <!-- svelte-ignore event_directive_deprecated -->
                <button
                    class="page-btn w-8 h-8 text-sm border rounded-md"
                    value={page}
                    on:click={movePage}
                >
                    {page}
                </button>
            {/if}
        {/each}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button
            class="page-btn w-8 h-8 text-sm border rounded-md"
            value="next"
            on:click={movePage}
        >
            <i class="fa fa-angle-right" aria-hidden="true"></i>
        </button>
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button
            class="page-btn w-8 h-8 text-sm border rounded-md"
            value="last_page"
            on:click={movePage}
        >
            <i class="fa fa-angle-double-right" aria-hidden="true"></i>
        </button>
    </div>
</div>

<style>
    .sticky-header {
        position: sticky;
        top: 0; /* 상단에 고정 */
        background-color: white; /* 배경색 지정 */
        z-index: 1; /* 다른 요소 위에 표시되도록 설정 */
    }

    .sticky-left {
        position: sticky;
        left: 0; /* 왼쪽에 고정 */
        background-color: white; /* 배경색 지정 */
        z-index: 2; /* 다른 요소 위에 표시되도록 설정 */
    }

    .fix_sized {
        max-height: 700px;
    }

    .table-wrapper {
        overflow-y: auto; /* 세로 스크롤 가능 */
        overflow-x: auto; /* 수평 스크롤 가능 */
        max-height: 100%; /* 부모 요소의 높이에 맞추어 설정 */
        position: relative;
    }
</style>

<script>
    import axios from "axios";
    import { back_api } from "$lib/const.js";
    import { setParams, createArray } from "$lib/lib.js";
    import { goto, invalidateAll } from "$app/navigation";
    import { page } from "$app/stores";

    // let loading = true;
    let { data } = $props();

    let minisiteData = $state([]);
    let pageArr = $state([]);
    let hyData = $state({});
    let nowPage = $state(0);
    let allPageCount = $state(0);

    let siteListOpt = $state(data.siteList);

    

    

    // 카피할 아이디 및 창 보이게 bool
    let copyRawBool = $state(true);
    let copyId = $state("");

    // 검색 변수
    let searchVal = $state("");

    // 현장 추가 변수
    let hy_num = $state("");
    let hy_site_name = $state("");

    let siteList = $state([]);
    let searchSite = $state("");
    let hy_manage_site = $state("");

    // 수정 / 삭제 / 복사 체크 리스트
    let checkedList = $state([]);
    let allChecked = $state(false);

    $effect(() => {
        minisiteData = data.minisiteData;
        pageArr = data.pageArr;
        nowPage = $page.url.searchParams.get("page") || 1;
        allPageCount = data.allPageCount;
    });

    function allCheckedChange() {
        if (this.checked) {
            checkedList = createArray(minisiteData.length);
        } else {
            checkedList = [];
        }
    }

    async function openEditWindow() {
        const hyId = this.getAttribute("data");
        const url = `/mini_window/${hyId}`; // 열고 싶은 페이지의 URL
        const windowName = "smallWindow"; // 새 창의 이름
        const features = "width=700,height=900,top=100,left=100"; // 창 크기와 위치 설정

        window.open(url, windowName, features);
    }

    async function addHySite() {
        if (!hy_num || !hy_site_name) {
            alert("모든 값을 입력하세요.");
            return;
        }
        try {
            const res = await axios.post(`${back_api}/minisite/add_hy_site`, {
                hy_num,
                hy_site_name,
                hy_manage_site,
            });
            if (res.status == 200) {
                if (res.data.err_message) {
                    alert("아이디 값이 중복됩니다.");
                    return;
                }
                alert("현장 추가가 완료 되었습니다.");
                hy_num = "";
                hy_site_name = "";
                hy_manage_site = "";
                invalidateAll();
            } else {
            }
        } catch (error) {}
    }

    function searchFunc() {
        setParams({ search: searchVal }, true);
        nowPage = 1;
    }

    async function updateRaw() {
        if (checkedList.length == 0) {
            alert("수정할 항목을 선택해주세요");
            return;
        }
        const updateData = checkedList.map((index) =>
            JSON.parse(JSON.stringify(minisiteData[index])),
        );

        try {
            const res = await axios.post(`${back_api}/minisite/update_hy_raw`, {
                updateData,
            });

            if (res.status == 200) {
                let addMessage = "";
                if (res.data.duplication_num > 0) {
                    addMessage = `${res.data.duplication_num}개의 값이 중복됩니다. 중복된 값은 업데이트 되지 않았습니다.`;
                }
                alert(`업데이트가 완료 되었습니다. ${addMessage}`);
                checkedList = [];
                invalidateAll();
            }
        } catch (error) {}
    }

    async function deleteRaw() {
        if (checkedList.length == 0) {
            alert("삭제할 항목을 선택해주세요");
            return;
        }

        if (
            !confirm(
                "삭제하는 항목은 복구가 불가하며 이미지등 데이터가 모두 삭제됩니다. 진행하시겠습니까?",
            )
        ) {
            return;
        }
        const deleteData = checkedList.map((index) =>
            JSON.parse(JSON.stringify(minisiteData[index])),
        );
        try {
            const res = await axios.post(`${back_api}/minisite/delete_hy_raw`, {
                deleteData,
            });
            if (res.status == 200) {
                alert("삭제가 완료 되었습니다.");
                checkedList = [];
                invalidateAll();
            }
        } catch (error) {}
    }

    async function copyHyData() {
        if (checkedList.length == 0) {
            alert("복사할 항목을 선택해주세요");
            return;
        } else if (checkedList.length > 1) {
            alert("복사할 현장은 한번에 한군데만 가능합니다.");
            return;
        }

        if (!copyId) {
            alert("복사 대상 아이디 값을 입력하세요");
            return;
        }
        const copyData = minisiteData[checkedList[0]];
        try {
            const res = await axios.post(`${back_api}/minisite/copy_hy_data`, {
                copyData,
                copyId,
            });
            if (res.status == 200) {
                alert("복사가 완료 되었습니다.");
                checkedList = [];
                copyId = "";
                invalidateAll();
            }
        } catch (err) {
            console.error(err);
            const m = err.response.data.message;
            alert(m ? m : "에러가 발생 했습니다.");
            return;
        }
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

    async function updateManageSite(e, getSite) {
        console.log(e.target.value);
        console.log(getSite);

        if (!getSite) {
            alert("연결할 담당자 사이트를 지정해주세요");
            return;
        }

        try {
            const res = await axios.post(
                `${back_api}/minisite/update_minisite_manager`,
                {
                    hy_id: e.target.value,
                    get_site: getSite,
                },
            );
            if (res.statsus == 200) {
                invalidateAll();
            }
        } catch (error) {}
    }
</script>

<dialog id="add_hy_modal" class="modal">
    <div class="modal-box">
        <div class="mb-3">
            고유번호(아이디)를 입력하세요
            <input type="text" class="input-base" bind:value={hy_num} />
        </div>
        <div class="mb-3">
            현장명을 입력하세요
            <input type="text" class="input-base" bind:value={hy_site_name} />
        </div>

        <div>
            연결한 현장을 선택하세요 (DB 입력시 필요)

            <div class="flex gap-2 mb-3">
                <input
                    type="text"
                    class="w-full py-1.5 px-2 border border-gray-300 bg-gray-100 focus:outline-none focus:bg-white focus:border-blue-500 rounded-md"
                    placeholder="현장 1차 검색, 필요할시에만"
                    bind:value={searchSite}
                />
                <!-- svelte-ignore event_directive_deprecated -->
                <button
                    class="btn btn-xs md:btn-sm btn-success text-white"
                    on:click={async () => {
                        try {
                            const res = await axios.post(
                                `${back_api}/minisite/get_site_list`,
                                { search_site: searchSite },
                            );
                            if (res.status == 200) {
                                siteList = res.data.site_list;
                                console.log(siteList);
                            }
                        } catch (error) {}
                    }}
                >
                    검색
                </button>
            </div>

            <select class="input-base" bind:value={hy_manage_site}>
                {#each siteList as site}
                    <option value={site.sl_site_name}>
                        {site.sl_site_name}
                    </option>
                {/each}
            </select>
        </div>

        <div class="modal-action">
            <form method="dialog">
                <!-- if there is a button in form, it will close the modal -->
                <!-- svelte-ignore event_directive_deprecated -->
                <!-- svelte-ignore event_directive_deprecated -->
                <button class="btn" on:click={addHySite}>적용</button>
            </form>
        </div>
    </div>
</dialog>

<div class="">
    <div class="pb-5 w-full flex gap-4">
        <div class="flex items-center gap-2">
            <input type="text" class="input-base" bind:value={searchVal} />
            <!-- svelte-ignore event_directive_deprecated -->
            <button
                class="btn btn-info btn-xs md:btn-sm text-white"
                on:click={searchFunc}
            >
                검색
            </button>
        </div>
        <div class="flex justify-center items-center gap-2">
            <!-- svelte-ignore event_directive_deprecated -->
            <!-- svelte-ignore event_directive_deprecated -->
            <button
                class="btn btn-xs md:btn-sm btn-success"
                on:click={async () => {
                    try {
                        const res = await axios.post(
                            `${back_api}/minisite/get_site_list`,
                        );
                        if (res.status == 200) {
                            siteList = res.data.site_list;
                            console.log(siteList);
                        }
                    } catch (error) {}
                    add_hy_modal.showModal();
                }}
            >
                현장추가
            </button>
            <!-- svelte-ignore event_directive_deprecated -->
            <button class="btn btn-xs md:btn-sm btn-info" on:click={updateRaw}>
                수정
            </button>
            <!-- svelte-ignore event_directive_deprecated -->
            <button class="btn btn-xs md:btn-sm btn-error" on:click={deleteRaw}>
                삭제
            </button>
            <!-- svelte-ignore event_directive_deprecated -->
            <button
                class="btn btn-xs md:btn-sm btn-warning"
                on:click={() => {
                    copyRawBool = false;
                }}
            >
                복사
            </button>

            <div class="flex items-center gap-1" class:hidden={copyRawBool}>
                <input
                    type="text"
                    class="input-base"
                    placeholder="아이디값을 입력하세요"
                    bind:value={copyId}
                />
                <!-- svelte-ignore event_directive_deprecated -->
                <button
                    class="btn btn-xs md:btn-sm btn-success text-white"
                    on:click={copyHyData}
                >
                    확인
                </button>
            </div>
        </div>
    </div>
    <table class="w-full text-xs md:text-sm text-center">
        <thead>
            <tr>
                <th class="in-th w-14">
                    <div class="flex justify-center items-center">
                        <!-- svelte-ignore event_directive_deprecated -->
                        <input
                            type="checkbox"
                            class="checkbox checkbox-xs md:checkbox-sm"
                            bind:checked={allChecked}
                            on:change={allCheckedChange}
                        />
                    </div>
                </th>
                <th class="in-th"> 아이디 </th>
                <th class="in-th"> 현장명 </th>
                <th class="in-th"> 담당연결 </th>
                <th class="in-th"> 바로보기 </th>
                <th class="in-th"> 조회수 </th>
            </tr>
        </thead>
        <tbody>
            {#each minisiteData as data, idx}
                <tr>
                    <td class="in-td py-3">
                        <div class="flex justify-center items-center">
                            <!-- svelte-ignore event_directive_deprecated -->
                            <input
                                type="checkbox"
                                value={idx}
                                class="checkbox checkbox-xs md:checkbox-sm"
                                bind:group={checkedList}
                                on:change={() => {
                                    if (
                                        checkedList.length !=
                                        minisiteData.length
                                    ) {
                                        allChecked = false;
                                    }
                                }}
                            />
                        </div>
                    </td>
                    <td class="in-td w-1/5">
                        <input
                            type="text"
                            class="input-base"
                            bind:value={minisiteData[idx].hy_num}
                        />
                    </td>
                    <td class="in-td">
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <!-- svelte-ignore event_directive_deprecated -->

                        <div class="flex justify-between items-center px-2">
                            <div class="w-full text-center">
                                <span
                                    class="cursor-pointer"
                                    data={minisiteData[idx].hy_id}
                                    on:click={openEditWindow}
                                >
                                    {minisiteData[idx].hy_title}
                                </span>
                            </div>
                            <button
                                class="btn btn-success btn-xs text-white"
                                data={minisiteData[idx].hy_id}
                                on:click={openEditWindow}
                            >
                                수정
                            </button>
                        </div>
                    </td>

                    <td class="in-td w-56">
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <!-- svelte-ignore event_directive_deprecated -->
                        <div class="flex gap-2 items-center px-2">
                            <select
                                class="border py-1 px-2 rounded-md w-36"
                                bind:value={minisiteData[idx].hy_manage_site}
                            >
                                {#each siteListOpt as siteOpt}
                                    <option value={siteOpt.sl_site_name}>
                                        {siteOpt.sl_site_name}
                                    </option>
                                {/each}
                            </select>
                            <button
                                class="btn btn-success btn-xs text-white"
                                value={minisiteData[idx].hy_id}
                                on:click={(e) => {
                                    const getSite =
                                        minisiteData[idx].hy_manage_site;
                                    updateManageSite(e, getSite);
                                }}
                            >
                                수정
                            </button>
                        </div>
                    </td>

                    <td class="in-td">
                        <a
                            href="/side/{minisiteData[idx].hy_num}"
                            target="_blank"
                        >
                            <button
                                class="btn btn-outline btn-accent btn-xs text-xs"
                            >
                                바로가기
                            </button>
                        </a>
                    </td>
                    <td class="in-td"> {minisiteData[idx].hy_counter} </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<div class="flex justify-center items-center my-5 gap-1">
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <!-- svelte-ignore event_directive_deprecated -->
    <button
        class="page-btn w-8 h-8 text-sm border rounded-md"
        value="first_page"
        on:click={movePage}
    >
        <i class="fa fa-angle-double-left" aria-hidden="true"></i>
    </button>
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <!-- svelte-ignore event_directive_deprecated -->
    <button
        class="page-btn w-8 h-8 text-sm border rounded-md"
        value="prev"
        on:click={movePage}
    >
        <i class="fa fa-angle-left" aria-hidden="true"></i>
    </button>
    {#each pageArr as page}
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
    <!-- svelte-ignore event_directive_deprecated -->
    <button
        class="page-btn w-8 h-8 text-sm border rounded-md"
        value="next"
        on:click={movePage}
    >
        <i class="fa fa-angle-right" aria-hidden="true"></i>
    </button>
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <!-- svelte-ignore event_directive_deprecated -->
    <button
        class="page-btn w-8 h-8 text-sm border rounded-md"
        value="last_page"
        on:click={movePage}
    >
        <i class="fa fa-angle-double-right" aria-hidden="true"></i>
    </button>
</div>

<script>
    import moment from "moment";
    import { page } from "$app/stores";
    import { setParams } from "$src/lib/lib.js";
    import { formatPhoneNumber } from "$src/lib/lib.js";
    import axios from "axios";
    import { backIn } from "svelte/easing";
    import { back_api } from "$src/lib/const.js";
    import { user_info } from "$src/lib/store.js";
    import { invalidateAll } from "$app/navigation";
    let { data } = $props();

    const timeString = "2024-12-30T22:20:34.000Z";
    const formattedTime = moment.utc(timeString).format("YY-MM-DD HH:mm:ss");
    console.log('설정 시간!!!');
    
    console.log(formattedTime);
    

    console.log(data);

    let datas = $state([]);
    let pages = $state([]);
    let reverseIdxArr = $state([]);

    // 쿼리 파라미터 연관 변수
    let pageCount = $state("30");
    let nowPage = $state(1);
    let startDate = $state(moment.utc().startOf("month").format("YYYY-MM-DD"));
    let endDate = $state(moment.utc().format("YYYY-MM-DD"));
    let filterSite = $state("");
    let setSite = $state("base");
    let setSiteStatus = $state(false);
    let setStatus = $state("base");

    let allPageCount = $state(0);

    let customer_id = $state(0);
    //
    let site_list = $state([]);
    let status_list = $state([]);

    // 고객 정보 모음
    let customerInfo = $state({});

    let add_memo_content = $state("");

    let copyListStr = $state([]);
    let copyList = $state([]);

    $effect(() => {
        datas = data.datas;
        pages = data.pageArr;
        nowPage = $page.url.searchParams.get("page") || 1;
        reverseIdxArr = data.reverseIdxArr;
        site_list = data.site_list;
        status_list = data.statusArr;

        allPageCount = data.allPage;
    });

    function searchFunc(e) {
        e.preventDefault();

        let paramOption = {};
        if (startDate) {
            paramOption["sd"] = startDate;
        }
        if (endDate) {
            paramOption["ed"] = endDate;
        }
        if (pageCount) {
            paramOption["pagecount"] = pageCount;
        }
        if (filterSite) {
            paramOption["filtersite"] = filterSite;
        }
        if (setSite != "base") {
            paramOption["setsite"] = setSite;
            setSiteStatus = true;
        }
        if (setStatus != "base") {
            paramOption["setstatus"] = setStatus;
        }

        setParams(paramOption, true);
    }

    function downloadExcel() {}

    async function openScheduleManageModal(load = false, id = 0) {
        if (load == true) {
            customer_id = id;
        } else {
            customer_id = this.value;
        }

        try {
            loadCustomerInfo(customer_id);
        } catch (error) {}

        schedule_manage_modal.showModal();
    }

    async function addMemo() {
        console.log(customer_id);

        if (!add_memo_content) {
            alert("메모 내용을 입력하세요.");
            return;
        }
        const af_id = this.value;

        try {
            const res = await axios.post(`${back_api}/alldb/add_memo_content`, {
                af_id,
                add_memo_content,
                manager: $user_info.name,
            });

            if (res.status == 200) {
                console.log("아니 안들어오는거야?!?!?!??!");
                loadCustomerInfo(customer_id);
            }
        } catch (err) {
            console.error(err.message);
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

    async function updateStatus() {
        console.log(this.value);
        const getIdx = this.value;
        console.log(datas[getIdx]);
        try {
            const res = await axios.post(`${back_api}/alldb/update_status`, {
                data: datas[getIdx],
            });
            if (res.status == 200) {
                alert("업데이트 완료");
                invalidateAll();
            }
        } catch (error) {}
    }

    async function deleteMemo() {
        if (!confirm("삭제한 메모는 복구가 불가합니다. 진행하시겠습니까?")) {
            return;
        }
        const getIdx = this.value;
        try {
            const res = await axios.post(`${back_api}/alldb/delete_memo`, {
                getIdx,
            });

            if (res.status == 200) {
                loadCustomerInfo(customer_id);
            }
        } catch (error) {}
    }

    async function loadCustomerInfo(customer_id) {
        console.log("들어는 오지?!?!");

        try {
            const res = await axios.post(
                `${back_api}/alldb/load_customer_info`,
                { customer_id },
            );

            console.log(res);

            if (res.status == 200) {
                customerInfo = res.data.customer_info;
                if (
                    customerInfo.memos &&
                    customerInfo.managers &&
                    customerInfo.createds
                ) {
                    const memos = customerInfo.memos.split("||");
                    const managers = customerInfo.managers.split(",");
                    const createds = customerInfo.createds.split(",");
                    const ids = customerInfo.ids.split(",");

                    customerInfo.memo_list = memos.map((_, index) => {
                        const reverseIndex = memos.length - 1 - index;
                        return {
                            memo: memos[reverseIndex],
                            idx: ids[reverseIndex],
                            manager: managers[reverseIndex],
                            created: createds[reverseIndex],
                        };
                    });

                    console.log(customerInfo);
                }
                add_memo_content = "";
                invalidateAll();
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    function selectDbChangeStatus() {
        copyList = [];
        for (let i = 0; i < datas.length; i++) {
            const ele = datas[i];
            if (!ele.af_mb_status) {
                const addVal = JSON.parse(JSON.stringify(ele));
                copyList.push(addVal);
            }
        }

        copyListStr = copyList
            .map((item) => {
                // 각 요소를 "이름 // 전화번호" 형태로 만들고
                // 전화번호는 formatPhone으로 포맷팅
                return `${item.af_mb_name} // ${formatPhoneNumber(item.af_mb_phone)}`;
            })
            // 요소들을 개행으로 연결
            .join("\n");

        console.log(copyListStr);

        copy_list_modal.showModal();
    }

    async function copyAndUpdateNormal() {
        try {
            navigator.clipboard.writeText(copyListStr);
            const res = await axios.post(`${back_api}/main/update_normal`, {
                copyList,
            });

            if (res.status == 200) {
                alert("복사 완료 되었습니다.");
                copyList = [];
                copyListStr = "";
                invalidateAll();
            }
        } catch (error) {
            alert('복사 실패! 다시 시도해주세요!')
        }
    }
</script>

<dialog id="copy_list_modal" class="modal">
    <div class="modal-box">
        <form method="dialog">
            <button
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
                ✕
            </button>
        </form>

        <div class=" whitespace-pre-wrap text-center">
            {copyListStr}
        </div>

        <div class="text-center mt-5">
            <form method="dialog">
                <!-- svelte-ignore event_directive_deprecated -->
                <!-- svelte-ignore event_directive_deprecated -->
                <button
                class="btn btn-neutral btn-sm text-white"
                on:click={copyAndUpdateNormal}
            >
                복사 및 업데이트 하기
            </button>
            </form>
            
        </div>
    </div>
</dialog>

<dialog id="schedule_manage_modal" class="modal">
    <div class="modal-box">
        <h3 class="text-lg font-bold">Hello!</h3>

        <div class="">
            <table class="w-full">
                <tbody>
                    <tr>
                        <th class="in-th bg-blue-100">현장</th>
                        <td class="in-td p-2"> {customerInfo.af_form_name} </td>
                    </tr>
                    <tr>
                        <th class="in-th bg-blue-100">이름</th>
                        <td class="in-td p-2"> {customerInfo.af_mb_name} </td>
                    </tr>
                    <tr>
                        <th class="in-th bg-blue-100">전화번호</th>
                        <td class="in-td p-2"> {customerInfo.af_mb_phone} </td>
                    </tr>
                    <tr>
                        <th class="in-th bg-blue-100">상태</th>
                        <td class="in-td p-2">
                            <select class="select select-sm select-bordered">
                                {#each status_list as status}
                                    <option value={status}>{status}</option>
                                {/each}
                            </select>
                            <button class="btn btn-secondary btn-sm">
                                변경
                            </button>
                            <!-- {customerInfo.af_mb_status}  -->
                        </td>
                    </tr>
                    <tr>
                        <th class="in-th bg-blue-100">접수시간</th>
                        <td class="in-td p-2">
                            {moment.utc(customerInfo.af_created_at).format(
                                "YY-MM-DD HH:mm:ss",
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="mt-3">
                <div class="flex items-center gap-1">
                    <input
                        type="text"
                        class="input-base"
                        bind:value={add_memo_content}
                    />
                    <!-- svelte-ignore event_directive_deprecated -->
                    <button
                        class="btn btn-primary btn-sm"
                        value={customerInfo.af_id}
                        on:click={addMemo}
                    >
                        메모 추가
                    </button>
                </div>
                <ul class="border-t border-r border-l mt-3 h-80 overflow-auto">
                    {#each customerInfo.memo_list as memo}
                        <li class="border-b p-2">
                            <div
                                class="flex justify-between gap-2 items-center"
                            >
                                <span>{memo.memo}</span>

                                <div>
                                    <!-- <button
                                        class="btn btn-info btn-xs text-white"
                                    >
                                        스케줄 추가
                                    </button> -->
                                    <!-- svelte-ignore event_directive_deprecated -->
                                    <button
                                        class="btn btn-error btn-xs text-white"
                                        value={memo.idx}
                                        on:click={deleteMemo}
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                            <div class="text-right text-xs mt-0.5">
                                {memo.created}
                            </div>
                        </li>
                    {/each}
                </ul>
            </div>
        </div>
        <div class="modal-action">
            <form method="dialog">
                <!-- if there is a button in form, it will close the modal -->
                <button class="btn">닫기</button>
            </form>
        </div>
    </div>
</dialog>

<div class="mb-4">
    <!-- svelte-ignore event_directive_deprecated -->
    <form on:submit={searchFunc}>
        <div class="flex flex-wrap items-center gap-2">
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

            <label
                class="input input-sm input-bordered flex items-center gap-2"
            >
                <input
                    type="text"
                    class="grow"
                    placeholder="현장 1차 검색"
                    bind:value={filterSite}
                />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    class="h-4 w-4 opacity-70"
                >
                    <path
                        fill-rule="evenodd"
                        d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                        clip-rule="evenodd"
                    />
                </svg>
            </label>

            <select
                class="select select-sm select-bordered"
                bind:value={setSite}
            >
                <option value="base">현장 선택</option>
                {#each site_list as site}
                    <option value={site.sl_site_name}
                        >{site.sl_site_name}</option
                    >
                {/each}
            </select>

            <select
                class="select select-sm select-bordered"
                bind:value={setStatus}
            >
                <option value="base">상태선택</option>
                {#each status_list as status}
                    <option value={status}>{status}</option>
                {/each}
            </select>

            <select
                class="select select-sm select-bordered"
                bind:value={pageCount}
            >
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>

            <button class="btn btn-neutral btn-sm"> 검색 </button>

            {#if setSiteStatus}
                <button
                    type="button"
                    class="btn btn-success btn-sm text-white"
                    on:click={selectDbChangeStatus}
                >
                    DB선택 / 상태변경
                </button>
            {/if}
            <button
                type="button"
                class="btn btn-info btn-sm text-white"
                on:click={downloadExcel}
            >
                DB 엑셀 다운
            </button>
        </div>
    </form>
</div>
<table class="w-full">
    <thead>
        <tr class="text-center">
            <th class="in-th"> 접수번호 </th>
            <th class="in-th"> 고객명 </th>
            <th class="in-th"> 전화번호 </th>
            <th class="in-th"> 현장 </th>
            <th class="in-th"> 메모 / 상태 </th>
            <th class="in-th"> 상태 </th>
            <th class="in-th"> 접수시간 </th>
        </tr>
    </thead>
    <tbody>
        {#each datas as data, idx}
            <tr class="text-center" style="background-color: {data.bg_color};">
                <td class="in-td p-2 w-[70px]">
                    {reverseIdxArr[idx]}
                </td>
                <td class="in-td p-2 w-[180px]">
                    {data.af_mb_name}
                </td>
                <td class="in-td p-2 w-[180px]">
                    {formatPhoneNumber(data.af_mb_phone) || data.af_mb_phone}
                </td>
                <td class="in-td p-2">
                    {data.af_form_name}
                </td>
                <td class="in-td p-2">
                    {#if data.memo_contents}
                        <div
                            class="mb-1 flex flex-col justify-center items-center"
                        >
                            <div class="ellipsis">
                                {data.memo_contents.split(",")[0]}
                            </div>
                            <div class="ellipsis">
                                {data.memo_contents.split(",")[1]}
                            </div>
                        </div>
                    {/if}

                    <div>
                        <!-- class=" bg-green-600 px-3 py-1 text-xs rounded-md text-white active:bg-green-700" -->
                        <!-- svelte-ignore event_directive_deprecated -->
                        <button
                            class="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3 rounded-md transform transition-transform duration-150
    active:scale-95"
                            value={data.af_id}
                            on:click={openScheduleManageModal}
                        >
                            메모/상태 확인 및 수정
                        </button>
                    </div>
                </td>
                <td class="in-td p-2">
                    <div>
                        {datas[idx]["af_mb_status"]}
                    </div>
                </td>
                <td class="in-td p-2">
                    {moment.utc(data.af_created_at).format("YY-MM-DD HH:mm:ss")}
                </td>
            </tr>
        {/each}
    </tbody>
</table>

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

<style>
    .ellipsis {
        /* display: inline-block; 혹은 block, flex 등 원하는 요소 성격에 맞춰 사용 */
        width: 300px; /* 원하는 너비 지정 */
        white-space: nowrap; /* 텍스트가 줄바꿈되지 않도록 설정 */
        overflow: hidden; /* 넘치는 텍스트는 숨김 */
        text-overflow: ellipsis; /* 넘치는 텍스트의 끝에 ... 표시 */
    }
</style>

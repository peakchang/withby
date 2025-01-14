<script>
    import { goto, invalidateAll } from "$app/navigation";
    import { page } from "$app/stores";
    import { back_api } from "$src/lib/const.js";
    import axios from "axios";
    import moment from "moment";
    import { isHashedPassword } from "$src/lib/lib.js";
    import { setParams } from "$src/lib/lib.js";

    let { data } = $props();
    let users = $state([]);
    let managers = $state([]);
    let pages = $state([]);

    let checkedList = $state([]);
    let allChecked = $state(false);

    // 검색~~~~
    let userRate = $state("");
    let searchName = $state("");
    let searchEmail = $state("");
    let allPageCount = $state(0);

    let nowPage = $state(0);

    userRate = $page.url.searchParams.get("user_rate") || "0";
    searchName = $page.url.searchParams.get("search_name");
    searchEmail = $page.url.searchParams.get("search_email");

    $effect(() => {
        users = data.user_datas;
        managers = data.manager_datas;
        pages = data.pageArr;
        allPageCount = data.allPage
        nowPage = parseInt($page.url.searchParams.get("page")) || 1
    });

    
    let siteList = $state([]);
    let siteSearchKeyword = $state("");
    let selectedEstate = $state([]);
    let selectedEstateStr = $state("");
    let userId = $state(0);

    async function loadSiteListFunc(e) {
        if (e.target.getAttribute("data-id")) {
            userId = e.target.getAttribute("data-id");
        }
        selectedEstateStr = e.target.value;
        selectedEstate = selectedEstateStr.split(",");

        try {
            const res = await axios.post(
                `${back_api}/usermanage/load_site_list`,
                { site_search_keyword: siteSearchKeyword },
            );
            if (res.status == 200) {
                siteList = res.data.site_list;
            }
        } catch (error) {}
    }

    async function updateUserSiteList() {
        const selectedEstateStr = selectedEstate.join(",");
        try {
            const res = await axios.post(
                `${back_api}/usermanage/update_user_site_list`,
                { selectedEstateStr, userId },
            );
            if (res.status == 200) {
                alert("변경이 완료되었습니다.");
                invalidateAll();
            }
        } catch (error) {}
    }
    function closeModal() {
        siteSearchKeyword = "";
        siteList = [];
        selectedEstateStr = "";
        selectedEstate = [];
    }

    async function updateUserInfo() {
        const getIdx = this.value;
        const type = this.getAttribute("data-type");

        if (type == "password") {
            if (
                isHashedPassword(users[getIdx]["password"]) ||
                !users[getIdx]["password"]
            ) {
                alert("변경하실 패스워드를 올바르게 입력 해주세요");
                return;
            }
        }

        try {
            const res = await axios.post(
                `${back_api}/usermanage/update_user_info`,
                { user_info: users[getIdx], type },
            );
            if (res.status == 200) {
                alert("업데이트가 완료 되었습니다.");
                invalidateAll();
            }
        } catch (error) {}
    }

    function userManageSearch(e) {
        e.preventDefault();

        let option = {};
        if (userRate != 0 || searchName || searchEmail) {
            if (userRate != 0) {
                option["user_rate"] = userRate;
            }
            if (searchName) {
                option["search_name"] = searchName;
            }
            if (searchEmail) {
                option["search_email"] = searchEmail;
            }
            setParams(option, true);
        } else if (userRate == 0 && !searchName && !searchEmail) {
            setParams({}, true);
        }
        nowPage = 1;
    }

    async function deleteUserRows() {
        if (checkedList.length == 0) {
            alert("삭제할 유저를 선택해주세요");
            return;
        }

        const deleteList = checkedList;

        try {
            const res = await axios.post(
                `${back_api}/usermanage/delete_user_rows`,
                { deleteList },
            );
            if (res.status == 200) {
                alert("삭제가 완료되었습니다.");
                invalidateAll();
            }
        } catch (error) {}
           
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

<dialog id="manage_estate_modal" class="modal">
    <div class="w-1/3 flex items-center gap-1">
        <input type="text" class="input-base" bind:value={siteSearchKeyword} />
        <!-- svelte-ignore event_directive_deprecated -->
        <button
            class="btn btn-info btn-sm text-white"
            value={selectedEstateStr}
            on:click={loadSiteListFunc}
        >
            검색
        </button>
        <!-- svelte-ignore event_directive_deprecated -->
        <button
            class="btn btn-accent btn-sm text-white"
            value={selectedEstateStr}
            on:click={updateUserSiteList}
        >
            적용
        </button>
        <form method="dialog">
            <div class="flex gap-1">
                <button class="btn btn-error btn-sm text-white"> 닫기 </button>
            </div>
        </form>
    </div>
    <div class="modal-box w-11/12 max-w-5xl relative max-h-[500px]">
        <form method="dialog">
            <!-- svelte-ignore event_directive_deprecated -->
            <button
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                on:click={closeModal}
            >
                ✕
            </button>
        </form>

        <div class="grid grid-cols-4 gap-1 mt-5">
            {#each siteList as site, idx}
                <label
                    ><div class="border p-2 flex items-center gap-2">
                        <input
                            type="checkbox"
                            class="checkbox checkbox-xs md:checkbox-sm"
                            bind:group={selectedEstate}
                            value={site.sl_site_name}
                        />
                        {site.sl_site_name}
                    </div>
                </label>
            {/each}
        </div>
    </div>
</dialog>
<form on:submit={userManageSearch}>
    <div class="mb-4 flex items-center gap-2">
        <select class="select select-bordered select-sm" bind:value={userRate}>
            <option value="0">전체</option>
            <option value="2">분양사</option>
            <option value="1">일반</option>
        </select>

        <span> 이름(닉네임) : </span>
        <input
            type="text"
            class="input input-bordered input-sm"
            placeholder="부분 입력 가능"
            bind:value={searchName}
        />

        <span>이메일 : </span>
        <input
            type="text"
            class="input input-bordered input-sm"
            placeholder="부분 입력 가능"
            bind:value={searchEmail}
        />

        <button class="btn btn-sm btn-info text-white">조회</button>
        <button
            type="button"
            class="btn btn-sm btn-error text-white"
            on:click={deleteUserRows}>선택삭제</button
        >
    </div>
</form>
<table class="w-full text-xs md:text-sm text-center">
    <thead>
        <tr>
            <th class="in-th w-12">
                <div class="flex items-center justify-center">
                    <input
                        type="checkbox"
                        class="checkbox checkbox-xs md:checkbox-sm"
                        bind:checked={allChecked}
                        on:change={(e) => {
                            if (allChecked) {
                                checkedList = users.map((v) => v.id);
                            } else {
                                checkedList = [];
                            }
                        }}
                    />
                </div>
            </th>
            <th class="in-th">아이디</th>
            <th class="in-th">이름</th>
            <th class="in-th">등급</th>
            <th class="in-th">비번변경</th>
            <th class="in-th">이메일</th>
            <th class="in-th">휴대폰</th>
            <th class="in-th">관리현장</th>
            <th class="in-th">가입일</th>
        </tr>
    </thead>
    <tbody>
        {#each managers as manager, idx}
            <tr>
                <td class="in-td py-2">
                    <div class="flex items-center justify-center"></div>
                </td>

                <td class="in-td py-2 px-2">
                    {manager.userid}
                </td>
                <td class="in-td py-2 px-2">
                    {manager.nick}
                </td>
                <td class="in-td py-2 px-2">
                    <div class="flex justify-center items-center gap-1">
                        매니저
                    </div>
                </td>
                <td class="in-td py-2 px-2">
                    <div class="flex justify-center items-center gap-1">
                        <input type="text" class="input-base" />

                        <button class="btn btn-primary btn-xs text-white">
                            변경
                        </button>
                    </div>
                </td>
                <td class="in-td py-2 px-2">
                    <div class="flex justify-center items-center gap-1">
                        <input
                            type="text"
                            class="input-base text-xs"
                            bind:value={managers[idx]["user_email"]}
                        />

                        <button class="btn btn-accent btn-xs text-white">
                            변경
                        </button>
                    </div>
                </td>
                <td class="in-td py-2 px-2">
                    <div class="flex justify-center items-center gap-1">
                        <input
                            type="text"
                            class="input-base text-xs"
                            bind:value={managers[idx]["user_phone"]}
                        />

                        <button class="btn btn-secondary btn-xs text-white">
                            변경
                        </button>
                    </div>
                </td>
                <td class="in-td py-2 px-2">
                    {#if manager.manage_estate}
                        {#each manager.manage_estate.split(",") as manage}
                            <div>
                                {manage}
                            </div>
                        {/each}
                        <!-- svelte-ignore event_directive_deprecated -->
                        <button
                            class="btn btn-primary btn-xs"
                            value={manager.manage_estate}
                            on:click={(e) => {
                                loadSiteListFunc(e);
                                manage_estate_modal.showModal();
                            }}
                        >
                            변경하기
                        </button>
                    {:else}
                        <!-- svelte-ignore event_directive_deprecated -->
                        <button
                            class="btn btn-primary btn-xs"
                            value={manager.manage_estate}
                            on:click={(e) => {
                                loadSiteListFunc(e);
                                manage_estate_modal.showModal();
                            }}
                        >
                            추가하기
                        </button>
                    {/if}
                </td>

                <td class="in-td py-2 px-2">
                    {moment.utc(manager.created_at).format("YY-MM-DD HH:mm:ss")}
                </td>
            </tr>
        {/each}
        {#each users as user, idx}
            <tr>
                <td class="in-td py-2">
                    <div class="flex items-center justify-center">
                        <input
                            type="checkbox"
                            class="checkbox checkbox-xs md:checkbox-sm"
                            value={user.id}
                            bind:group={checkedList}
                        />
                    </div>
                </td>
                <td class="in-td py-2 px-2">
                    {user.userid}
                </td>
                <td class="in-td py-2 px-2 w-20">
                    {user.nick}
                </td>
                <td class="in-td py-2 px-2">
                    <div class="flex justify-center items-center gap-1">
                        <select
                            class="select select-bordered select-sm w-full max-w-xs"
                            bind:value={users[idx]["rate"]}
                        >
                            <option value="2">분양사</option>
                            <option value="1">일반</option>
                        </select>

                        <!-- svelte-ignore event_directive_deprecated -->
                        <button
                            class="btn btn-info btn-xs text-white"
                            value={idx}
                            on:click={updateUserInfo}
                        >
                            변경
                        </button>
                    </div>
                </td>
                <td class="in-td py-2 px-2">
                    <div class="flex justify-center items-center gap-1">
                        <!-- svelte-ignore event_directive_deprecated -->
                        <input
                            type="text"
                            class="input-base"
                            on:input={(e) => {
                                users[idx]["password"] = e.target.value;
                            }}
                        />

                        <!-- svelte-ignore event_directive_deprecated -->
                        <button
                            class="btn btn-primary btn-xs text-white"
                            value={idx}
                            data-type="password"
                            on:click={updateUserInfo}
                        >
                            변경
                        </button>
                    </div>
                </td>
                <td class="in-td py-2 px-2">
                    <div class="flex justify-center items-center gap-1">
                        <input
                            type="text"
                            class="input-base text-xs"
                            bind:value={users[idx]["user_email"]}
                        />

                        <!-- svelte-ignore event_directive_deprecated -->
                        <button
                            class="btn btn-accent btn-xs text-white"
                            value={idx}
                            on:click={updateUserInfo}
                        >
                            변경
                        </button>
                    </div>
                </td>
                <td class="in-td py-2 px-2">
                    <div class="flex justify-center items-center gap-1">
                        <input
                            type="text"
                            class="input-base text-xs"
                            bind:value={users[idx]["user_phone"]}
                        />

                        <!-- svelte-ignore event_directive_deprecated -->
                        <button
                            class="btn btn-secondary btn-xs text-white"
                            value={idx}
                            on:click={updateUserInfo}
                        >
                            변경
                        </button>
                    </div>
                </td>
                <td class="in-td py-2 px-2">
                    {#if user.manage_estate}
                        {#each user.manage_estate.split(",") as manage}
                            <div>
                                {manage}
                            </div>
                        {/each}
                        <!-- svelte-ignore event_directive_deprecated -->
                        <button
                            class="btn btn-primary btn-xs"
                            value={user.manage_estate}
                            data-id={user.id}
                            on:click={(e) => {
                                loadSiteListFunc(e);
                                manage_estate_modal.showModal();
                            }}
                        >
                            변경하기
                        </button>
                    {:else}
                        <!-- svelte-ignore event_directive_deprecated -->
                        <button
                            class="btn btn-primary btn-xs"
                            value={user.manage_estate}
                            data-id={user.id}
                            on:click={(e) => {
                                loadSiteListFunc(e);
                                manage_estate_modal.showModal();
                            }}
                        >
                            추가하기
                        </button>
                    {/if}
                </td>

                <td class="in-td py-2 px-2">
                    {moment.utc(user.created_at).format("YY-MM-DD HH:mm:ss")}
                </td>
            </tr>
        {/each}
    </tbody>
</table>

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

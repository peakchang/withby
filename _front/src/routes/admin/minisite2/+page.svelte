<script>
    import { invalidateAll } from "$app/navigation";
    import { back_api, back_api_origin } from "$src/lib/const.js";
    import axios from "axios";
    import { page } from "$app/stores";

    let { data } = $props();
    let mDatas = $state([]);
    let selectIdx = $state(0);
    let checkedList = $state([]);

    let host = $state($page.url.host);
    if (import.meta.env.VITE_ENV == "dev") {
        host = "localhost:5173";
    }

    $effect(() => {
        mDatas = data.minisiteData;
    });

    // 현장들 변경할때 쓰는 변수
    let filterKeyword = $state("");
    let siteList = $state([]);
    let setSite = $state("none");

    let addSubDomainVal = $state("");
    let addSubDomainBool = $state(true);

    //

    async function searchSiteList() {
        try {
            const res = await axios.post(
                `${back_api}/minisite/load_site_list`,
                { filter_keyword: filterKeyword },
            );
            if (res.status == 200) {
                siteList = res.data.site_list;
            }
        } catch (error) {}
    }

    async function applySite() {
        const ld_id = this.value;
        try {
            const res = await axios.post(`${back_api}/minisite/apply_site`, {
                ld_id,
                setSite,
            });
            if (res.status == 200) {
                alert("현장 변경이 완료 되었습니다.");
                mDatas.forEach((data) => (data["change_val"] = false));
                mDatas[selectIdx]["ld_site"] = setSite;
                siteList = [];
                filterKeyword = "";
                setSite = "none";
                invalidateAll();
            }
        } catch (error) {}
    }

    async function addSubDomain() {
        addSubDomainVal = addSubDomainVal.replace(/\s/g, "");

        try {
            const res = await axios.post(
                `${back_api}/minisite/add_sub_domain`,
                { addSubDomainVal },
            );
            if (res.status == 200) {
                alert("도메인이 추가되었습니다.");
                addSubDomainVal = "";
                invalidateAll();
                addSubDomainBool = false;
            }
        } catch (error) {}
    }

    async function changeTypeFunc() {
        const idx = this.value;
        const ld_view_type = mDatas[idx]["ld_view_type"];
        const ld_id = mDatas[idx]["ld_id"];
        if (!ld_view_type) {
            alert("타입을 선택해주세요~");
            return;
        }

        try {
            const res = await axios.post(
                `${back_api}/minisite/update_site_type`,
                {
                    ld_view_type,
                    ld_id,
                },
            );
            if (res.status == 200) {
                invalidateAll();
                alert("업데이트 완료!");
            }
        } catch (error) {}
    }

    async function deleteSite() {
        console.log(checkedList);
        if (!confirm("사이트를 삭제하면 이미지 등 전부 삭제됨! 후회 NO?")) {
            return;
        }

        try {
            const res = await axios.post(
                `${back_api_origin}/api/subdomain/delete_site`,
                { checkedList },
            );
        } catch (err) {
            const m = err.response.data.message;
            alert(m ? m : "에러! 다시 시도해주세요!");
        }
    }
</script>

<div>
    <div class="mb-2">
        <!-- svelte-ignore event_directive_deprecated -->
        <button
            class="btn btn-success btn-sm text-white"
            on:click={() => {
                addSubDomainBool = !addSubDomainBool;
            }}
        >
            사이트 추가
        </button>

        <!-- svelte-ignore event_directive_deprecated -->
        <button class="btn btn-error btn-sm text-white" on:click={deleteSite}>
            사이트 삭제
        </button>
    </div>
    <div
        class="mb-1 w-1/2 md:w-1/3 flex gap-2 items-center"
        class:hidden={addSubDomainBool}
    >
        <input type="text" class="input-base" bind:value={addSubDomainVal} />
        <!-- svelte-ignore event_directive_deprecated -->
        <button class="btn btn-info btn-sm text-white" on:click={addSubDomain}>
            도메인 추가
        </button>
    </div>
    <div class="mb-2 text-xs text-red-500">
        ※ 고급 미니사이트 현장 삭제는 각 사이트의 "관리" 페이지로 들어가서 삭제
        해주세요
    </div>

    <table class="w-full">
        <thead>
            <tr>
                <th class="in-th" style="padding-top:10px;">
                    <input
                        type="checkbox"
                        class="checkbox checkbox-xs md:checkbox-sm"
                    />
                </th>
                <th class="in-th text-xs md:text-sm">사이트 이름</th>
                <th class="in-th text-xs md:text-sm">서브도메인</th>
                <th class="in-th text-xs md:text-sm">관리</th>
                <th class="in-th text-xs md:text-sm">
                    타입
                    <span class=" font-normal text-xs">
                        (없으면 자동으로 옛날거)
                    </span>
                </th>
                <th class="in-th text-xs md:text-sm">현장</th>
                <th class="in-th text-xs md:text-sm">조회수</th>
                <th class="in-th text-xs md:text-sm">콜카운트</th>
                <th class="in-th text-xs md:text-sm">문자카운트</th>
            </tr>
        </thead>
        <tbody>
            {#each mDatas as mdata, idx}
                <tr>
                    <td class="in-td text-center" style="padding-top:8px;">
                        <input
                            type="checkbox"
                            class="checkbox checkbox-xs md:checkbox-sm"
                            value={mdata.ld_id}
                            bind:group={checkedList}
                        />
                    </td>
                    <td class="in-td text-center">
                        {mDatas[idx]["ld_name"]}
                    </td>
                    <td class="in-td text-center">
                        {mDatas[idx]["ld_domain"]}
                    </td>
                    <td class="in-td">
                        <div class="px-2 flex flex-wrap gap-2 justify-center">
                            <a
                                href={`${$page.url.protocol}//${mDatas[idx]["ld_domain"]}.${host}`}
                                class="btn btn-outline btn-info btn-xs"
                                target="_blank"
                            >
                                <i
                                    class="fa fa-mouse-pointer"
                                    aria-hidden="true"
                                ></i>
                                <span>사이트</span>
                            </a>
                            <a
                                href={`${$page.url.protocol}//${mDatas[idx]["ld_domain"]}.${host}/visit`}
                                class="btn btn-outline btn-success btn-xs"
                                target="_blank"
                            >
                                <i class="fa fa-link" aria-hidden="true"></i>
                                <span>방문자수</span>
                            </a>

                            {#if mDatas[idx]["ld_view_type"] == "old"}
                                <a
                                    href={`${$page.url.protocol}//${mDatas[idx]["ld_domain"]}.${host}/setting`}
                                    class="btn btn-success btn-xs text-white"
                                    target="_blank"
                                >
                                    <i class="fa fa-cog" aria-hidden="true"></i>
                                    <span>관리</span>
                                </a>
                            {:else}
                                <a
                                    href={`${$page.url.protocol}//${mDatas[idx]["ld_domain"]}.${host}/site_set`}
                                    class="btn btn-success btn-xs text-white"
                                    target="_blank"
                                >
                                    <i class="fa fa-cog" aria-hidden="true"></i>
                                    <span>관리</span>
                                </a>
                            {/if}
                        </div>
                    </td>
                    <td class="in-td text-center">
                        <div class="p-2 flex items-center gap-2 justify-center">
                            <label class="flex items-center gap-1.5">
                                <input
                                    type="radio"
                                    value="old"
                                    class="radio radio-secondary radio-xs"
                                    bind:group={mDatas[idx]["ld_view_type"]}
                                />
                                <span>옛날거</span>
                            </label>

                            <label class="flex items-center gap-1.5">
                                <input
                                    type="radio"
                                    value="new"
                                    class="radio radio-secondary radio-xs"
                                    bind:group={mDatas[idx]["ld_view_type"]}
                                />
                                <span>새거</span>
                            </label>
                            <!-- svelte-ignore event_directive_deprecated -->
                            <button
                                class="btn btn-secondary btn-xs"
                                value={idx}
                                on:click={changeTypeFunc}
                            >
                                변경
                            </button>
                        </div>
                    </td>
                    <td class="in-td text-center">
                        <div class="flex items-center gap-3 px-3">
                            <div>
                                <!-- svelte-ignore event_directive_deprecated -->
                                <button
                                    class="btn btn-error btn-xs text-white"
                                    value={idx}
                                    on:click={(e) => {
                                        selectIdx = e.target.value;
                                        if (mDatas[selectIdx]["change_val"]) {
                                            mDatas.forEach(
                                                (data) =>
                                                    (data["change_val"] =
                                                        false),
                                            );
                                        } else {
                                            mDatas.forEach(
                                                (data) =>
                                                    (data["change_val"] =
                                                        false),
                                            );

                                            mDatas[selectIdx]["change_val"] =
                                                true;
                                        }
                                    }}
                                >
                                    변경
                                </button>
                            </div>
                            <div class="flex justify-between">
                                <span>
                                    {mDatas[idx]["ld_site"]}
                                </span>
                            </div>
                        </div>

                        <div hidden={!mDatas[idx]["change_val"]}>
                            <div class="flex gap-1 px-2 items-center mt-2 mb-2">
                                <input
                                    type="text"
                                    class="input-base"
                                    bind:value={filterKeyword}
                                />
                                <!-- svelte-ignore event_directive_deprecated -->
                                <button
                                    class="btn btn-outline btn-info btn-xs h-8"
                                    value={mDatas[idx]["ld_id"]}
                                    on:click={searchSiteList}
                                >
                                    검색
                                </button>
                            </div>

                            <div class="flex gap-1 px-2 items-center">
                                <select
                                    class="select select-info w-full max-w-xs select-sm"
                                    bind:value={setSite}
                                >
                                    <option disabled selected value="none"
                                        >1차 검색을 완료 해주세요</option
                                    >
                                    {#each siteList as site}
                                        <option value={site.sl_site_name}>
                                            {site.sl_site_name}
                                        </option>
                                    {/each}
                                </select>
                                <!-- svelte-ignore event_directive_deprecated -->
                                <button
                                    class="btn btn-outline btn-info btn-xs h-8"
                                    value={mDatas[idx]["ld_id"]}
                                    on:click={applySite}
                                >
                                    적용
                                </button>
                            </div>
                        </div>
                    </td>
                    <td class="in-td text-center">
                        {mDatas[idx]["ld_visit_count"]}
                    </td>
                    <td class="in-td text-center">
                        {mDatas[idx]["ld_call_clickcount"]}
                    </td>
                    <td class="in-td text-center">
                        {mDatas[idx]["ld_sms_clickcount"]}
                    </td>
                </tr>
            {/each}
            <tr></tr>
        </tbody>
    </table>
</div>

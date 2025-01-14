<script>
    import { back_api } from "$src/lib/const.js";
    import axios from "axios";

    let { data } = $props();

    let siteList = $state([]);
    let setSite = $state("ready");
    let filterSiteVal = $state("");

    $effect(() => {
        siteList = data.siteList;
    });

    let dbData = $state(
        "전화번호,이름\n전화번호,이름\n이 부분은 삭제하고 입력 해주세요",
    );

    async function filterSiteList() {
        try {
            const res = await axios.post(
                `${back_api}/adminbase/dbupload_site_list`,
                { filterSiteVal },
            );
            if (res.status == 200) {
                siteList = res.data.site_list;
            }
        } catch (error) {}
    }

    async function uploadDb() {
        if (setSite == "ready") {
            alert("현장을 선택해주세요");
            return;
        }
        const splitLine = dbData.split("\n");
        const uploadDbDate = splitLine
            .map((line) => {
                if (line.trim()) {
                    const [phone, name] = line.split(",");
                    return { af_mb_name: name, af_mb_phone: phone };
                }
                return undefined;
            })
            .filter((item) => item !== undefined);

        try {
            const res = await axios.post(
                `${back_api}/adminbase/upload_db_data`,
                { uploadDbDate, setSite },
            );
            if (res.status == 200) {
                alert("DB 업로드 성공!");
                dbData = "";
                setSite = "ready";
            }
        } catch (error) {}
    }
</script>

<div class=" max-w-[920px] border p-5 md:flex gap-3">
    <div class="md:w-1/2">
        <textarea
            class="w-full border-2 border-gray-500 rounded-xl p-3"
            rows="10"
            bind:value={dbData}
        ></textarea>
    </div>

    <div class="md:w-1/2 text-center flex flex-col justify-around">
        <form on:submit={filterSiteList}>
            <div class="mb-0.5 flex gap-1">
                <input
                    type="text"
                    placeholder="검색할 현장을 입력하세요 (일부 입력 가능)"
                    class="input input-bordered w-full input-sm"
                    bind:value={filterSiteVal}
                />
                <button class="btn btn-success btn-sm text-white">
                    검색
                </button>
            </div>
            <div class="mb-1 ml-2 text-left text-red-500 text-xs">
                전체 리스트가 나오게 하려면 INPUT 창을 빈 공간으로 두고
                검색버튼을 클릭 or 엔터!
            </div>
        </form>
        <div class="mb-2">
            <select
                class="select select-bordered w-full select-sm"
                bind:value={setSite}
            >
                <option value="ready">선택하세요</option>
                {#each siteList as site}
                    <option value={site.sl_site_name}
                        >{site.sl_site_name}</option
                    >
                {/each}
            </select>
        </div>
        <div class="mb-2">
            <button
                class="btn btn-info w-full btn-sm text-white"
                on:click={uploadDb}>업로드</button
            >
        </div>
    </div>
</div>

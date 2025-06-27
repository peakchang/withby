<script>
    import SortImg from "$src/lib/components/SortImg.svelte";
    import OneImg from "$src/lib/components/OneImg.svelte";
    import { page } from "$app/stores";
    import axios from "axios";
    import { back_api } from "$src/lib/const.js";
    import { invalidateAll } from "$app/navigation";

    let { data } = $props();
    let hyData = $state({});
    let modifyImgArr = $state([]);

    hyData = data.hyData;

    if (data.hyData.hy_image_list) {
        modifyImgArr = data.hyData.hy_image_list.split(",");
    }

    function imageUpdate(e) {
        hyData[e.value] = e.saveUrl;
        console.log(hyData);
    }

    function updateImgList(e) {
        const tempImgArr = e.map((val) => val.href);
        hyData["hy_image_list"] = tempImgArr.join(",");
    }

    async function updateHySite() {
        try {
            const res = await axios.post(
                `${back_api}/minisite/update_hy_data`,
                hyData,
            );

            if (res.status == 200) {
                alert("수정이 완료 되었습니다.");
                invalidateAll();
            }
        } catch (error) {}
    }
</script>

<div class="suit-font px-3">
    <form method="dialog">
        <div class="pb-3 text-base flex justify-between">
            <span> 현장명 수정 페이지 </span>

            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button>
                <i class="fa fa-times" aria-hidden="true"></i>
            </button>
        </div>
    </form>
    <table class="w-full">
        <tbody>
            <tr>
                <th class="in-th text-sm bg-slate-100 border-slate-300">
                    현장명
                </th>
                <td class="in-td">
                    <input
                        type="text"
                        class="input-base text-xs"
                        bind:value={hyData.hy_title}
                    />
                </td>
            </tr>
            <tr>
                <th class="in-th text-sm bg-slate-100 border-slate-300"
                    >간략설명</th
                >
                <td class="in-td">
                    <input
                        type="text"
                        class="input-base text-xs"
                        bind:value={hyData.hy_description}
                    />
                </td>
            </tr>
            <tr>
                <th class="in-th text-sm bg-slate-100 border-slate-300"
                    >사이트명</th
                >
                <td class="in-td">
                    <input
                        type="text"
                        class="input-base text-xs"
                        bind:value={hyData.hy_site_name}
                    />
                </td>
            </tr>
            <tr>
                <th class="in-th text-sm bg-slate-100 border-slate-300"
                    >사업명</th
                >
                <td class="in-td">
                    <input
                        type="text"
                        class="input-base text-xs"
                        bind:value={hyData.hy_businessname}
                    />
                </td>
            </tr>
            <tr>
                <th class="in-th text-sm bg-slate-100 border-slate-300">분류</th
                >
                <td class="in-td">
                    <input
                        type="text"
                        class="input-base text-xs"
                        bind:value={hyData.hy_type}
                    />
                </td>
            </tr>
            <tr>
                <th class="in-th text-sm bg-slate-100 border-slate-300">규모</th
                >
                <td class="in-td">
                    <input
                        type="text"
                        class="input-base text-xs"
                        bind:value={hyData.hy_scale}
                    />
                </td>
            </tr>
            <tr>
                <th class="in-th text-sm bg-slate-100 border-slate-300"
                    >전용면적</th
                >
                <td class="in-td">
                    <input
                        type="text"
                        class="input-base text-xs"
                        bind:value={hyData.hy_areasize}
                    />
                </td>
            </tr>
            <tr>
                <th class="in-th text-sm bg-slate-100 border-slate-300"
                    >세대수</th
                >
                <td class="in-td">
                    <input
                        type="text"
                        class="input-base text-xs"
                        bind:value={hyData.hy_house_number}
                    />
                </td>
            </tr>
            <tr>
                <th class="in-th text-sm bg-slate-100 border-slate-300"
                    >공급위치</th
                >
                <td class="in-td">
                    <input
                        type="text"
                        class="input-base text-xs"
                        bind:value={hyData.hy_location}
                    />
                </td>
            </tr>
            <tr>
                <th class="in-th text-sm bg-slate-100 border-slate-300"
                    >입주예정</th
                >
                <td class="in-td">
                    <input
                        type="text"
                        class="input-base text-xs"
                        bind:value={hyData.hy_scheduled}
                    />
                </td>
            </tr>
            <tr>
                <th class="in-th text-sm bg-slate-100 border-slate-300"
                    >카카오링크</th
                >
                <td class="in-td">
                    <input
                        type="text"
                        class="input-base text-xs"
                        bind:value={hyData.hy_kakao_link}
                    />
                </td>
            </tr>
            <tr>
                <th class="in-th text-sm bg-slate-100 border-slate-300"
                    >특장점</th
                >
                <td class="in-td">
                    <textarea
                        rows="12"
                        class="w-full p-2 border bg-gray-150 focus:outline-none focus:border-blue-500 text-sm"
                        bind:value={hyData.hy_features}
                    >
                    </textarea>
                </td>
            </tr>
            <tr>
                <th class="in-th text-sm bg-slate-100 border-slate-300"
                    >추가 스크립트</th
                >
                <td class="in-td">
                    <textarea
                        rows="8"
                        class="w-full border bg-gray-150 focus:outline-none focus:border-blue-500 text-sm"
                        bind:value={hyData.hy_add_script}
                    >
                    </textarea>
                </td>
            </tr>
            <tr>
                <th class="in-th text-sm bg-slate-100 border-slate-300"
                    >전화번호</th
                >
                <td class="in-td">
                    <input
                        type="text"
                        class="input-base text-xs"
                        bind:value={hyData.hy_callnumber}
                    />
                </td>
            </tr>
            <tr>
                <th class="in-th text-sm bg-slate-100 border-slate-300"
                    >문자번호</th
                >
                <td class="in-td">
                    <input
                        type="text"
                        class="input-base text-xs"
                        bind:value={hyData.hy_sms}
                    />
                </td>
            </tr>
            <tr>
                <th class="in-th text-sm bg-slate-100 border-slate-300"
                    >명함이미지</th
                >
                <td class="in-td">
                    <div>
                        <OneImg
                            value={"hy_card_image"}
                            updateImg={imageUpdate}
                            imgFolder={hyData.hy_num}
                            imageLink={hyData.hy_card_image}
                            btnSize={"sm"}
                        ></OneImg>
                    </div>
                </td>
            </tr>
            <tr>
                <th class="in-th text-sm bg-slate-100 border-slate-300">
                    메인이미지
                </th>
                <td class="in-td">
                    <div>
                        <OneImg
                            value={"hy_main_image"}
                            updateImg={imageUpdate}
                            imgFolder={hyData.hy_num}
                            imageLink={hyData.hy_main_image}
                            btnSize={"sm"}
                        ></OneImg>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
    <div class="mt-3 p-3 border rounded-md">
        <div class="mb-3 font-semibold">이미지 리스트</div>
        <SortImg
            updateImg={updateImgList}
            imgFolder={hyData.hy_num}
            btnLocation="center"
            imgModifyList={modifyImgArr}
        ></SortImg>
    </div>

    <div class="my-5">
        <div class="text-center">
            <!-- if there is a button, it will close the modal -->
            <!-- svelte-ignore event_directive_deprecated -->
            <button
                type="button"
                class="btn btn-accent text-white mr-5 min-h-9 h-9"
                on:click={updateHySite}
            >
                업데이트
            </button>
            <!-- svelte-ignore event_directive_deprecated -->
            <button
                class="btn min-h-9 h-9"
                on:click={() => {
                    window.close();
                }}
            >
                닫기
            </button>
        </div>
    </div>
</div>

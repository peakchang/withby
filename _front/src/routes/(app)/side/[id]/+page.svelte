<script>
    import { page } from "$app/stores";
    

    let imageOrigin = import.meta.env.VITE_SERVER_URL
        ? import.meta.env.VITE_SERVER_URL
        : $page.url.origin;



    let { data } = $props();

    let minisiteData = $state({});
    let imgList = $state([]);

    minisiteData = data.minisiteData;
    // svelte-ignore state_referenced_locally
    if (minisiteData.hy_image_list) {
        imgList = minisiteData.hy_image_list.split(",");
    }

    let formArea = $state();
</script>

<svelte:head></svelte:head>

<dialog id="personal_info_modal" class="modal suit-font">
    <div class="modal-box">
        <form method="dialog">
            <button
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
                ✕
            </button>
        </form>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            광고성 정보수신 동의
        </h3>
        <div class="p-6 space-y-6">
            <p
                class="text-base leading-relaxed text-gray-500 dark:text-gray-400"
            >
                ※ 서비스 안내 및 이용권유 등
            </p>
            <p
                class="text-base leading-relaxed text-gray-500 dark:text-gray-400"
            >
                ① 제공받는 자 : 애드피크
            </p>
            <p
                class="text-base leading-relaxed text-gray-500 dark:text-gray-400"
            >
                ② 제공목적 : 서비스 안내 및 이용권유, 사은·판촉행사 등의 마케팅
                활동, 시장조사 및 상품·서비스 개발연구 등 고객데이터 수집 및
                관리
            </p>
            <p
                class="text-base leading-relaxed text-gray-500 dark:text-gray-400"
            >
                ③ 수집항목 : 이름, 휴대폰번호
            </p>
            <p
                class="text-base leading-relaxed text-gray-500 dark:text-gray-400"
            >
                ④ 수집 및 이용기간 : 문의 종료일로 2년까지
            </p>
            <p
                class="text-base leading-relaxed text-gray-500 dark:text-gray-400"
            >
                회원님은 동의를 거부할 권리가 있으며 동의 거부 시에도 서비스
                이용에 제한이 없습니다. 다만 서비스 이용권유, 판촉행사 등의
                유익한 정보를 받으실 수 없습니다.
            </p>
        </div>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button>close</button>
    </form>
</dialog>

<dialog id="ad_info_modal" class="modal suit-font">
    <div class="modal-box">
        <form method="dialog">
            <button
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
                ✕
            </button>
        </form>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            개인정보 제3자 제공 동의
        </h3>
        <div class="p-6 space-y-6">
            <p
                class="text-base leading-relaxed text-gray-500 dark:text-gray-400"
            >
                ※ 서비스 안내 및 이용권유 등
            </p>
            <p
                class="text-base leading-relaxed text-gray-500 dark:text-gray-400"
            >
                ① 제공받는 자 : 애드피크
            </p>
            <p
                class="text-base leading-relaxed text-gray-500 dark:text-gray-400"
            >
                ② 제공목적 : 서비스 안내 및 이용권유, 사은·판촉행사 등의 마케팅
                활동, 시장조사 및 상품·서비스 개발연구 등 고객데이터 수집 및
                관리
            </p>
            <p
                class="text-base leading-relaxed text-gray-500 dark:text-gray-400"
            >
                ③ 수집항목 : 이름, 휴대폰번호
            </p>
            <p
                class="text-base leading-relaxed text-gray-500 dark:text-gray-400"
            >
                ④ 수집 및 이용기간 : 문의 종료일로 2년까지
            </p>
            <p
                class="text-base leading-relaxed text-gray-500 dark:text-gray-400"
            >
                회원님은 동의를 거부할 권리가 있으며 동의 거부 시에도 서비스
                이용에 제한이 없습니다. 다만 서비스 이용권유, 판촉행사 등의
                유익한 정보를 받으실 수 없습니다.
            </p>
        </div>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button>close</button>
    </form>
</dialog>

<div class="container max-w-4xl px-1 mx-auto suit-font">
    <div>
        <img src={imageOrigin + minisiteData.hy_main_image} alt="" />
    </div>

    <form method="post" id="user_form">
        <div
            class="my-4 mx-auto border relative py-5 rounded-lg"
            bind:this={formArea}
        >
            <div class="text-center">
                <div
                    class="my-4 w-full px-3 mx-auto grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <div
                        class="flex items-center border border-gray-300 rounded-full overflow-hidden py-1 px-3"
                    >
                        <div class="w-1/5 border-r">이름</div>
                        <div class="w-4/5">
                            <input
                                type="text"
                                name="af_mb_name"
                                class="w-full border-none rounded-full focus:outline-none"
                                placeholder="이름을 입력하세요!"
                            />
                        </div>
                    </div>

                    <div
                        class="flex items-center border border-gray-300 rounded-full overflow-hidden py-1 px-3"
                    >
                        <div class="w-1/5 border-r">연락처</div>
                        <div class="w-4/5 flex">
                            <input
                                type="text"
                                name="phnum_1"
                                value="010"
                                class="border-none px-4 py-1 rounded-md w-1/3 focus:outline-none"
                                readonly
                            />
                            <span class="flex items-center">-</span>
                            <input
                                type="text"
                                name="phnum_2"
                                class="border-none px-4 py-1 rounded-md w-1/3 focus:outline-none"
                            />
                            <span class="flex items-center">-</span>
                            <input
                                type="text"
                                name="phnum_3"
                                class="border-none px-4 py-1 rounded-md w-1/3 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div class="w-3/4 md:w-1/2 mx-auto py-1">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" class="allchk" />
                        <span>전체동의</span>
                    </label>
                </div>

                <div class="w-3/4 md:w-1/2 mx-auto text-xs md:text-sm py-1">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" class="personal_info" checked />
                        <span>개인정보 수집 동의</span>
                        <!-- svelte-ignore event_directive_deprecated -->
                        <button
                            type="button"
                            on:click={() => {
                                personal_info_modal.showModal();
                            }}
                        >
                            [보기]
                        </button>
                    </label>
                </div>

                <div class="w-3/4 md:w-1/2 mx-auto text-xs md:text-sm pb-4">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" class="ad_info" checked />
                        <span>광고성 정보수신 동의</span>
                        <!-- svelte-ignore event_directive_deprecated -->
                        <button
                            type="button"
                            on:click={() => {
                                ad_info_modal.showModal();
                            }}
                        >
                            [보기]
                        </button>
                    </label>
                </div>
                <button
                    class="w-3/4 md:w-1/2 text-white rounded-md py-1 font-bold mx-auto"
                >
                    <img
                        src="/minisite/success_btn.webp"
                        alt=""
                        class="max-w-fit w-full mx-auto"
                    />
                </button>
            </div>
        </div>
    </form>

    <div
        class="grid grid-cols-1 md:grid-cols-2 border-t-2 my-3 py-3 border-b-2"
    >
        <table>
            <tbody>
                <tr>
                    <th class="py-1" style="width:30%"
                        >사&nbsp;&nbsp;업&nbsp;&nbsp;명</th
                    >
                    <td>{minisiteData.hy_businessname}</td>
                </tr>
                <tr>
                    <th class="py-1" style="width:30%"
                        >분&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;류</th
                    >
                    <td>{minisiteData.hy_type}</td>
                </tr>
                <tr>
                    <th class="py-1" style="width:30%"
                        >규&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;모</th
                    >
                    <td>{minisiteData.hy_scale}</td>
                </tr>
            </tbody>
        </table>
        <table>
            <tbody>
                <tr>
                    <th class="py-1" style="width:30%">전용면적</th>
                    <td>{minisiteData.hy_areasize}</td>
                </tr>
                <tr>
                    <th class="py-1" style="width:30%"
                        >세&nbsp;&nbsp;대&nbsp;&nbsp;수</th
                    >
                    <td>{minisiteData.hy_house_number}</td>
                </tr>
                <tr>
                    <th class="py-1" style="width:30%">공급위치</th>
                    <td>{minisiteData.hy_location}</td>
                </tr>
                <tr>
                    <th class="py-1" style="width:30%">입주예정</th>
                    <td>{minisiteData.hy_scheduled}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="border-b-2 mb-3 pb-3">
        <div>
            <div
                class="border border-l-8 border-l-red-700 rounded-lg p-1 pl-6 font-semibold text-xl tracking-widest"
            >
                현장 특장점
            </div>
        </div>

        <div>
            <div
                class="border rounded-lg p-4 mt-4 hy_features_area whitespace-pre-line"
            >
                {@html minisiteData.hy_features}
            </div>
        </div>
    </div>

    <div>
        {#each imgList as img}
            <div>
                <img src={imageOrigin + img} alt="" />
            </div>
        {/each}
    </div>
</div>

<!-- PC 우측 고정!!! -->
<div class="fixed bottom-6 right-3 md:right-7 z-10 hidden md:block suit-font">
    {#if minisiteData.hy_kakao_link}
        <a href={minisiteData.hy_kakao_link} target="_blank">
            <button class="border rounded-full block w-28 mb-3">
                <img src="/minisite/right_fix_katalk.png" alt="" />
            </button>
        </a>
    {:else}
        <a href="https://pf.kakao.com/_sxmHKxj/chat" target="_blank">
            <button class="border rounded-full block w-28 mb-3">
                <img src="/minisite/right_fix_katalk.png" alt="" />
            </button>
        </a>
    {/if}

    {#if minisiteData.hy_callnumber}
        <div
            class="border rounded-full w-28 h-28 mb-3 bg-black text-white flex justify-center items-center"
        >
            <div class="text-center leading-none">
                <p class="font-bold text-xl">대표번호</p>
                <p class="font-extrabold text-lg">
                    {minisiteData.hy_callnumber}
                </p>
            </div>
        </div>
    {:else}
        <div
            class="border rounded-full w-28 h-28 mb-3 bg-black text-white flex justify-center items-center"
        >
            <div class="text-center leading-none">
                <p class="font-bold text-xl">대표번호</p>
                <p class="font-extrabold text-lg">1644</p>
                <p class="font-extrabold text-lg">9714</p>
            </div>
        </div>
    {/if}

    <button
        class="border border-emerald-600 w-28 h-28 p-5 rounded-full bg-emerald-600 block"
        on:click={() => {
            formArea.scrollIntoView({ behavior: "smooth" });
        }}
    >
        <span class="animate-pulse font-semibold text-lg text-white">
            관심고객<br />
            등록하기
        </span>
    </button>
</div>

<!-- 모바일 하단 고정!! -->
<div
    class="fixed bottom-0 left-0 w-full z-30 grid grid-cols-2 text-center text-lg text-white md:hidden"
    style="background-color: rgba( 0, 34, 102, 0.7 );"
>
    {#if minisiteData.hy_callnumber}
        <a href="TEL:{minisiteData.hy_callnumber}">
            <div>
                <img src="/minisite/call_btn.webp" alt="" />
            </div>
        </a>

        <a
            href="SMS:{minisiteData.hy_sms}?body={minisiteData.hy_title} 문의드립니다. 분양가 / 모델하우스위치가 어떻게 되나요?"
        >
            <div>
                <img src="/minisite/sms_btn.webp" alt="" />
            </div>
        </a>
    {:else}
        <a href="TEL:1644-9714">
            <div>
                <img src="/minisite/call_btn.webp" alt="" />
            </div>
        </a>
        <a
            href="SMS:010-7907-1127?body={minisiteData.hy_title} 문의드립니다. 분양가 / 모델하우스위치가 어떻게 되나요?"
        >
            <div>
                <img src="/minisite/sms_btn.webp" alt="" />
            </div>
        </a>
    {/if}
</div>

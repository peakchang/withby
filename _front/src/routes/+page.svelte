<script>
    import Seo from "$src/lib/components/Seo.svelte";
    import { user_info } from "$src/lib/store.js";

    const seoValue = {
        title: "위드분양",
        description: "현장에서는 내가 1등! 위드분양과 함께 최고의 성과를!",
        keywords:
            "부동산 분양,아파트 분양,오피스텔 분양,지식산업센터 분양,레지던스 분양,부동산 분양 정보,아파트 분양 정보,오피스텔 분양 정보,지식산업센터 분양 정보,레지던스 분양 정보,아파트 청약,분양정보",
        url: "https://withby.kr/",
        main: true,
    };

    let { data } = $props();
    let loading = $state(true);
    let footerData = data.footerData ? data.footerData : {};

    console.log(footerData);
    

    $effect(() => {
        AOS.init();
        loading = false;

        swiper = new Swiper(".mainswiper", {
            // Optional parameters
            autoHeight: true,
            loop: true,
            slidesPerView: 2,
            spaceBetween: 20,
            autoplay: {
                delay: 1500,
                disableOnInteraction: false,
            },
            breakpoints: {
                640: {
                    slidesPerView: 3,
                    spaceBetween: 20,
                },
            },
        });
    });
</script>

<svelte:head>
    <Seo {seoValue}></Seo>
</svelte:head>
<!-- <svelte:window bind:innerWidth /> -->
{#if loading}
    <div class="text-center my-10">
        <span class="loading loading-dots loading-lg"></span>
    </div>
{/if}

<div class="fixed w-full left-0 bottom-0" style="z-index: 9999999;">
    <div class=" max-w-[860px] mx-auto bg-white py-3">
        <img src="/footer-phone.webp" alt="">
    </div>

</div>

<div class=" max-w-[860px] mx-auto">
    <div>
        <img src="/mainpage/1.webp" alt="" />
    </div>
    <div class="bg-[url('/mainpage/2-back.png')]">
        <img src="/mainpage/2-1.png" alt="" />
    </div>
    <div class="bg-[url('/mainpage/2-back.png')] pb-6">
        <div data-aos="fade-up">
            <img src="/mainpage/2-slide/111.png" class="mx-auto" alt="" />
        </div>
        <div data-aos="fade-up">
            <img src="/mainpage/2-slide/222.png" class="mx-auto" alt="" />
        </div>
        <div data-aos="fade-up">
            <img src="/mainpage/2-slide/333.png" class="mx-auto" alt="" />
        </div>
        <div data-aos="fade-up">
            <img src="/mainpage/2-slide/444.png" class="mx-auto" alt="" />
        </div>
        <div data-aos="fade-up">
            <img src="/mainpage/2-slide/555.png" class="mx-auto" alt="" />
        </div>
    </div>

    <div class="swiper mainswiper">
        <div class="swiper-wrapper">
            <div class="swiper-slide">
                <img src="/mainpage/swipe/with-katalk-1.jpg" alt="" />
            </div>
            <div class="swiper-slide">
                <img src="/mainpage/swipe/with-katalk-2.jpg" alt="" />
            </div>
            <div class="swiper-slide">
                <img src="/mainpage/swipe/with-katalk-3.jpg" alt="" />
            </div>
            <div class="swiper-slide">
                <img src="/mainpage/swipe/with-katalk-4.jpg" alt="" />
            </div>
            <div class="swiper-slide">
                <img src="/mainpage/swipe/with-katalk-5.jpg" alt="" />
            </div>
            <div class="swiper-slide">
                <img src="/mainpage/swipe/with-katalk-6.jpg" alt="" />
            </div>
            <div class="swiper-slide">
                <img src="/mainpage/swipe/with-katalk-7.jpg" alt="" />
            </div>
        </div>
        <div class="swiper-pagination"></div>
    </div>

    <div class="bg-[url('/mainpage/3-back.webp')]">
        <div>
            <img src="/mainpage/3-1.png" class="mx-auto" alt="" />
        </div>
    </div>
</div>

<div id="ft" class=" mb-16 md:mb-20 mx-auto max-w-[860px]">
    <div class="container pb-10 suit-font mx-auto">
        <div class="">
            <div class="text-center">
                <div class="suit_font text-center mt-5 text-xs md:text-base">
                    {#if footerData["fs_personal_officer"]}
                        <span class="inline-block mr-4">
                            개인정보책임자 : {footerData.fs_personal_officer}
                        </span>
                    {/if}

                    {#if footerData.fs_owner}
                        <span class="inline-block mr-4">
                            대표 : {footerData.fs_owner}
                        </span>
                    {/if}

                    {#if footerData.fs_company}
                        <span class="inline-block mr-4">
                            회사명 : {footerData.fs_company}
                        </span>
                    {/if}

                    {#if footerData.fs_address}
                        <span class="inline-block mr-4">
                            주소 : {footerData.fs_address}
                        </span>
                    {/if}

                    {#if footerData.fs_email}
                        <span class="inline-block mr-4">
                            이메일 : {footerData.fs_email}
                        </span>
                    {/if}

                    {#if footerData.fs_business_num}
                        <span class="inline-block mr-4">
                            사업자번호 : {footerData.fs_business_num}
                        </span>
                    {/if}

                    {#if footerData.fs_callnumber}
                        <span class="inline-block mr-4">
                            전화 : {footerData.fs_callnumber}
                        </span>
                    {/if}

                    {#if footerData.fs_report_number}
                        <span class="inline-block mr-4">
                            통신판매업신고번호 : {footerData.fs_report_number}
                        </span>
                    {/if}

                    {#if $user_info.rate > 3}
                        <span class=" text-blue-600">
                            <a class="nav-link" href="/admin" target="_blank"
                                >CRM 바로가기</a
                            >
                        </span>
                    {:else}
                        <span class="text-blue-600">
                            <a class="nav-link" href="/admin" target="_blank">
                                CRM 바로가기
                            </a>
                        </span>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .swiper {
        padding: 30px 0;
        width: 100%;
        height: 100%;
    }

    .swiper-slide {
        text-align: center;
        font-size: 18px;
        background: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        height: auto;
    }

    .swiper-slide img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
</style>

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

    $effect(() => {
        const swiper = new Swiper(".mainswiper", {
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

<div class=" max-w-[860px] mx-auto px-2">
    <div class="mt-10 rounded-lg overflow-hidden">
        <div class="bg-[url('/mainpage2/main-back.jpg')]">
            <img src="/mainpage2/main1-1.png" alt="" />
        </div>

        <div class="video-background">
            <video autoplay muted loop playsinline>
                <source src="/mainpage2/main-video1.mp4" type="video/mp4" />
                브라우저가 video 태그를 지원하지 않습니다.
            </video>

            <div class="content">
                <!-- 여기에 텍스트나 버튼 등 넣기 -->
                <img src="/mainpage2/main1-2.png" alt="" />
            </div>
        </div>
        <div>
            <img src="/mainpage2/main1-foot.png" alt="" class="w-full" />
        </div>
    </div>

    <div class="mt-5 rounded-lg overflow-hidden">
        <div class="bg-[url('/mainpage2/main-back.jpg')]">
            <img src="/mainpage2/main2.png" alt="" />
        </div>
    </div>

    <div class="mt-5">
        <div class="bg-[url('/mainpage2/main-back.jpg')]">
            <img src="/mainpage2/main3.png" alt="" />
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

    

    <div class="mt-10 rounded-lg overflow-hidden">
        <div class="video-background">
            <video autoplay muted loop playsinline>
                <source src="/mainpage2/main-video2.mp4" type="video/mp4" />
                브라우저가 video 태그를 지원하지 않습니다.
            </video>

            <div class="content">
                <!-- 여기에 텍스트나 버튼 등 넣기 -->
                <img src="/mainpage2/main4.png" alt="" />
            </div>
        </div>
    </div>
    <br class="mt-10" />
    <div>lsadjfliasjdlifj</div>
</div>

<style>
    .video-background {
        position: relative;
        width: 100%;
        overflow: hidden;
        display: inline-block;
        padding: 30px 0;
    }

    .video-background video {
        position: absolute;
        top: 50%;
        left: 50%;
        min-width: 100%;
        min-height: 100%;
        width: auto;
        height: auto;
        transform: translate(-50%, -50%);
        object-fit: cover;
        z-index: -1;
    }

    .video-background .content {
        width: 100%;
        height: auto;
        display: block;
        position: relative;
        z-index: 1;
        color: white;
        text-align: center;
    }

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

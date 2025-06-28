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

    <div class="mt-5 rounded-lg overflow-hidden">
        <div class="bg-[url('/mainpage2/main-back.jpg')]">
            <img src="/mainpage2/main3.png" alt="" />
        </div>
    </div>

    <div class="mt-5">
        <div class="bg-[url('/mainpage2/main-back.jpg')]">
            <img src="/mainpage2/main4.png" alt="" />
        </div>
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
    <br class="mt-10">
    <div>
        lsadjfliasjdlifj
    </div>
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
</style>

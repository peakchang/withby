<script>
    import axios from "axios";
    import { back_api, back_api_origin } from "$src/lib/const";
    import { page } from "$app/stores";
    import uploadImageAct from "$src/lib/lib.js";

    let {
        updateImg,
        imgFolder = "",
        imageLink = "",
        btnSize = "",
        value = "",
        btnLocation = "center",
    } = $props();

    let imageOrigin = import.meta.env.VITE_SERVER_URL
        ? import.meta.env.VITE_SERVER_URL
        : $page.url.origin;

    // 이미지를 선택하면 사이즈 변경 (최대 1200px) 및 webp 변경 후 업로드
    function onFileSelected() {
        console.log("클릭클릭!!!");

        uploadImageAct(
            `${back_api}/img_upload_set`,
            (err, data) => {
                console.log(err);

                console.log(data);

                updateImg({ saveUrl: data.saveUrl, value });
            },
            {
                folder: imgFolder,
            },
        );
    }


    async function deleteImg() {
        const getImgSplit = imageLink.split("/");
        const delFolder = getImgSplit[getImgSplit.length - 2];
        const delFile = getImgSplit[getImgSplit.length - 1];
        try {
            const res = await axios.post(`${back_api}/delete_sort_img`, {
                delFolder,
                delFile,
            });

            if (res.status == 200) {
                imageLink = "";
                updateImg({ saveUrl: "", value });
            } else {
                alert("에러가 발생했습니다. 다시 시도해주세요");
            }
        } catch (error) {
            console.error(error.message);
        }
    }
</script>

{#if imageLink}
    <div class=" max-w-[700px] w-full">
        <img src={imageOrigin + imageLink} alt="" />
    </div>
{:else}
    <div></div>
{/if}

<!-- svelte-ignore event_directive_deprecated -->

<div
    class:text-center={btnLocation == "center"}
    class:text-left={btnLocation == "left"}
    class:text-right={btnLocation == "right"}
>
    {#if imageLink}
        <button
            class="btn btn-error text-white mt-3"
            class:btn-sm={btnSize == "sm"}
            class:btn-xs={btnSize == "xs"}
            on:click={deleteImg}
        >
            <i class="fa fa-trash" aria-hidden="true"></i>
            <span>이미지 삭제</span>
        </button>
    {:else}
        <button
            class="btn btn-info text-white mt-3"
            class:btn-sm={btnSize == "sm"}
            class:btn-xs={btnSize == "xs"}
            on:click={onFileSelected}
        >
            <i class="fa fa-upload" aria-hidden="true"></i>
            <span>이미지 업로드</span>
        </button>
    {/if}
</div>

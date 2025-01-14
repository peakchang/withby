<script>
    import imageCompression from "browser-image-compression";
    import axios from "axios";
    import { back_api } from "$src/lib/const";
    import { page } from "$app/stores";

    let {
        updateImg,
        imgFolder = "",
        imageLink = "",
        btnLocation = "center",
    } = $props();

    console.log(imageLink);

    let imageOrigin = import.meta.env.VITE_SERVER_URL ? import.meta.env.VITE_SERVER_URL : $page.url.origin;
    console.log(imageOrigin);

    // 이미지를 선택하면 사이즈 변경 (최대 1200px) 및 webp 변경 후 업로드
    const onFileSelected = (e) => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", ".png,.jpg,.jpeg");
        input.click();

        // input change
        input.onchange = async (e) => {
            const imageFile = e.target.files[0];
            const options = {
                maxSizeMB: 1, // 최대 파일 크기 (MB)
                maxWidthOrHeight: 1024, // 최대 너비 또는 높이
                useWebWorker: true, // 웹 워커 사용
            };

            try {
                const compressedFile = await imageCompression(
                    imageFile,
                    options,
                );
                console.log("Compressed file:", compressedFile);
                console.log(compressedFile.name);

                let imgForm = new FormData();

                const timestamp = new Date().getTime();
                const fileName = `${timestamp}${Math.random()
                    .toString(36)
                    .substring(2, 11)}.${compressedFile.name.split(".")[1]}`;

                imgForm.append("onimg", compressedFile, fileName);
                imgForm.append("folderName", imgFolder); // �����명 추가 (��가할 경우)
                let res = {};
                try {
                    res = await axios.post(
                        `${back_api}/upload_sort_img`,
                        imgForm,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                        },
                    );
                    if (res.status == 200) {
                        imageLink = res.data.baseUrl;
                        updateImg(res.data.baseUrl);
                    }
                } catch (error) {
                    console.error("Error during image upload:", error.message);
                    alert("이미지 업로드 오류! 다시 시도해주세요!");
                    return;
                }
            } catch (error) {
                console.error("Error during image compression:", error);
                alert("이미지 업로드 오류! 다시 시도해주세요!");
            }
        };
    };

    async function deleteImg() {
        const getImgSplit = imageLink.split("/");
        const getFolder = getImgSplit[getImgSplit.length - 2];
        const getImgName = getImgSplit[getImgSplit.length - 1];

        console.log(getImgName);
        try {
            const res = await axios.post(`${back_api}/delete_sort_img`, {
                getImgName,
                getFolder,
            });

            if (res.status == 200) {
                imageLink = "";
                updateImg("");
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
            class="btn btn-error min-h-8 h-8 text-white mt-3"
            on:click={deleteImg}
        >
            <i class="fa fa-trash" aria-hidden="true"></i>
            <span>이미지 삭제</span>
        </button>
    {:else}
        <button
            class="btn btn-info min-h-8 h-8 text-white mt-3"
            on:click={onFileSelected}
        >
            <i class="fa fa-upload" aria-hidden="true"></i>
            <span>이미지 업로드</span>
        </button>
    {/if}
</div>

<script>
    import { tick } from "svelte";
    import imageCompression from "browser-image-compression";
    import axios from "axios";
    import { back_api } from "$src/lib/const";
    import { page } from "$app/stores";
    console.log($page);

    let imageOrigin = import.meta.env.VITE_SERVER_URL
        ? import.meta.env.VITE_SERVER_URL
        : $page.url.origin;

    let {
        updateImg,
        maxImgCount = 999999,
        imgModifyList = [],
        btnLocation = "center",
        imgFolder = "",
    } = $props();

    let imgArr = $state([]);
    if (imgModifyList.length > 0) {
        console.log(imgModifyList);

        imgArr = imgModifyList;
    }

    let positions = new Map();
    let animating = false;

    let hoverColor = "#FFFFD2"; // 드래그 드롭시 변경되는 배경색 (변경 가능)

    let hoveredIndex = $state(null); // 현재 마우스 오버 인덱스
    let draggedIndex = $state(null); // 드래그된 인덱스 (모바일용)

    function dragOverAction() {
        updateImg(imgArr);
    }

    async function deleteImg() {
        const arrIdx = this.value;
        const deleteData = imgArr[arrIdx];

        const getImgSplit = deleteData.split("/");
        const getFolder = getImgSplit[getImgSplit.length - 2];
        const getImgName = getImgSplit[getImgSplit.length - 1];

        console.log(getFolder);
        console.log(getImgName);

        console.log(getImgName);
        try {
            const res = await axios.post(`${back_api}/delete_sort_img`, {
                getImgName,
                getFolder,
            });

            if (res.status == 200) {
                imgArr.splice(arrIdx, 1);
                updateImg(imgArr);
            } else {
                alert("에러가 발생했습니다. 다시 시도해주세요");
            }
        } catch (error) {
            console.error(error.message);
        }

        // const res = await axios.post()
    }

    // 이미지를 선택하면 사이즈 변경 (최대 1200px) 및 webp 변경 후 업로드
    const onFileSelected = (e) => {
        if (imgArr.length >= maxImgCount) {
            alert(`최대 ${maxImgCount}개 이미지만 업로드 가능합니다.`);
            return false;
        }

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

                console.log(fileName);

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
                        imgArr.push(res.data.baseUrl);
                        imgArr = [...new Set(imgArr)];
                        updateImg(imgArr);
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

    // *************** 아래는 정렬되는 드래그 앤 드롭 함수!!! 건들지 말자!!! ********************
    // 상태 관리

    function measurePositions() {
        const elements = document.querySelectorAll("li");
        positions = new Map(
            Array.from(elements).map((el) => [
                el.dataset.key,
                el.getBoundingClientRect(),
            ]),
        );
    }

    async function handleDragStart(event, index) {
        measurePositions();
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", index);
    }

    function handleDragOver(event, index) {
        event.preventDefault();
        hoveredIndex = index;
    }

    function handleDragLeave(event, index) {
        if (hoveredIndex === index) {
            hoveredIndex = null;
        }
    }

    async function handleDrop(event, index) {
        event.preventDefault();
        const fromIndex = Number(event.dataTransfer.getData("text/plain"));

        if (fromIndex === index) return;

        const updatedItems = [...imgArr];
        [updatedItems[fromIndex], updatedItems[index]] = [
            updatedItems[index],
            updatedItems[fromIndex],
        ];

        await animateSwap(fromIndex, index);

        imgArr = updatedItems;
        hoveredIndex = null;
    }

    // 모바일 터치 이벤트 핸들러
    function handleTouchStart(event, index) {
        measurePositions();
        draggedIndex = index;
    }

    function handleTouchMove(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!target) return;

        const index = Array.from(target.parentNode.children).indexOf(target);
        if (index !== -1 && index !== draggedIndex) {
            hoveredIndex = index;
        }
    }

    async function handleTouchEnd(event) {
        if (draggedIndex === null || hoveredIndex === null) {
            draggedIndex = null;
            hoveredIndex = null;
            return;
        }

        const updatedItems = [...imgArr];
        [updatedItems[draggedIndex], updatedItems[hoveredIndex]] = [
            updatedItems[hoveredIndex],
            updatedItems[draggedIndex],
        ];

        await animateSwap(draggedIndex, hoveredIndex);

        imgArr = updatedItems;
        draggedIndex = null;
        hoveredIndex = null;
    }

    async function animateSwap(fromIndex, toIndex) {
        animating = true;

        measurePositions();

        const fromKey = imgArr[fromIndex];
        const toKey = imgArr[toIndex];

        const fromPos = positions.get(fromKey);
        const toPos = positions.get(toKey);

        const deltaX = toPos.left - fromPos.left;
        const deltaY = toPos.top - fromPos.top;

        const fromElement = document.querySelector(`li[data-key="${fromKey}"]`);
        const toElement = document.querySelector(`li[data-key="${toKey}"]`);

        fromElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        toElement.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;

        await tick();
        fromElement.style.transition = "transform 0.3s ease";
        toElement.style.transition = "transform 0.3s ease";

        await new Promise((resolve) => setTimeout(resolve, 300));

        fromElement.style.transform = "";
        toElement.style.transform = "";
        fromElement.style.transition = "";
        toElement.style.transition = "";

        animating = false;
    }

    function imageDragOver(e) {
        e.preventDefault();
        console.log("drag over?!?!??!");
    }

    function imageDrop(e) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        console.log(file);

        // // 드래그된 것이 이미지가 맞는지 체크
        // if (file && file.type.startsWith("image/")) {
        //     // 로컬 파일을 브라우저에서 미리 보기 위한 객체 URL 생성
        //     droppedImageUrl = URL.createObjectURL(file);
        //     console.log("이미지 드롭 성공!", file);
        // } else {
        //     console.error("이미지가 아닌 파일입니다.", file);
        // }
        // console.log("drop?!?!??!");
    }
</script>

<ul>
    {#each imgArr as img, index (img)}
        <!-- svelte-ignore event_directive_deprecated -->
        <li
            draggable="true"
            data-key={img}
            on:dragstart={(event) => handleDragStart(event, index)}
            on:dragover={(event) => handleDragOver(event, index)}
            on:dragleave={(event) => handleDragLeave(event, index)}
            on:drop={(event) => handleDrop(event, index)}
            on:touchstart={(event) => handleTouchStart(event, index)}
            on:touchmove={handleTouchMove}
            on:touchend={handleTouchEnd}
            class={hoveredIndex === index ? "hovered" : ""}
            style="--hover-color: {hoverColor}"
        >
            <div class="w-full h-full flex items-center relative">
                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button
                    class="absolute top-0 right-0 text-red-600 cursor-default"
                    value={index}
                    on:click={deleteImg}
                >
                    <i class="fa fa-times-circle-o"></i>
                </button>

                <img src={imageOrigin + img} alt="" />
            </div>
        </li>
    {/each}
</ul>

<div id="app" class="pretendard mt-3">
    <div>
        <!-- svelte-ignore event_directive_deprecated -->
        <button
            class="flex justify-center items-center gap-2 bg-green-600 active:bg-green-700 py-2 w-1/2 rounded-md text-white"
            class:mx-auto={btnLocation == "center"}
            class:ml-auto={btnLocation == "right"}
            on:click={onFileSelected}
        >
            <i class="fa fa-file-image-o" aria-hidden="true"></i>
            <span>이미지 업로드</span>
        </button>
    </div>
</div>

<div class="dropzone mt-3" on:dragover={imageDragOver} on:drop={imageDrop}>
    업로드 할 이미지를 드래그 하세요
</div>

<!-- class:text-left={btnLocation == "left"}
        class:text-center={btnLocation == "center"}
        class:text-right={btnLocation == "right"} -->

<style>
    .dropzone {
        width: 100%;
        height: 100px;
        border: 2px dashed #ccc;
        border-radius: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #aaa;
    }
    ul {
        list-style: none;
        padding: 0;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    li {
        padding: 5px;
        width: 120px;
        height: 120px;
        background: #f3f3f3;
        border: 1px solid #ddd;
        cursor: grab;
        overflow: hidden;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        transition: background-color 0.3s ease;
    }
    li.hovered {
        background: var(--hover-color, red); /* 오버된 상태의 배경색 */
    }
</style>

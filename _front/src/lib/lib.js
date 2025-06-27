import { goto } from "$app/navigation";
import imageCompression from "browser-image-compression";
import axios from "axios";



export const dataURItoBlob = (dataURI) => {
    const bytes =
        dataURI.split(",")[0].indexOf("base64") >= 0
            ? atob(dataURI.split(",")[1])
            : unescape(dataURI.split(",")[1]);
    const mime = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const max = bytes.length;
    const ia = new Uint8Array(max);
    for (let i = 0; i < max; i++) ia[i] = bytes.charCodeAt(i);
    return new Blob([ia], { type: mime });
};


export function getPagination(currentPage, maxPage = 30) {
    const range = 7; // 보여줄 페이지 범위
    const halfRange = Math.floor(range / 2);

    let start = Math.max(1, currentPage - halfRange);
    let end = Math.min(maxPage, currentPage + halfRange);

    // Adjust start and end if the range is less than 7
    if (end - start < range - 1) {
        if (start === 1) {
            end = Math.min(maxPage, start + range - 1);
        } else if (end === maxPage) {
            start = Math.max(1, end - range + 1);
        }
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}


export function isHashedPassword(input) {
    // bcrypt
    const bcryptRegex = /^\$2[ayb]\$.{56}$/;
    if (bcryptRegex.test(input)) return true;

    // SHA-256
    const sha256Regex = /^[a-f0-9]{64}$/;
    if (sha256Regex.test(input)) return true;

    // MD5
    const md5Regex = /^[a-f0-9]{32}$/;
    if (md5Regex.test(input)) return true;

    return false; // 해시 패턴이 아니면 false
}


export function setParams(params, clear = false) {
    const currentUrl = new URL(window.location.href);
    const searchParams = new URLSearchParams(clear ? '' : currentUrl.search); // clear가 true면 초기화

    // 새로운 파라미터 추가
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) {
            searchParams.delete(key); // null 또는 undefined는 삭제
        } else {
            searchParams.set(key, value.toString()); // 값 추가
        }
    }

    // URL 갱신
    currentUrl.search = searchParams.toString();
    console.log('Updated URL:', currentUrl.toString()); // 디버깅용

    // URL 변경
    goto(currentUrl.pathname + currentUrl.search, { replaceState: true, invalidateAll: true });
}


export function createArray(n) {
    return Array.from({ length: n }, (_, i) => i);
}

export function formatPhoneNumber(input) {
    // 특수문자 제거
    const sanitized = input.replace(/[^0-9]/g, '');

    if (sanitized.length === 11) {
        // 11자리 형식: 010-2529-5915
        return sanitized.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (sanitized.length === 10) {
        // 10자리 형식: 02-529-5915
        return sanitized.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
    } else if (sanitized.length === 8) {
        // 8자리 형식: 5454-6565
        return sanitized.replace(/(\d{4})(\d{4})/, '$1-$2');
    } else {
        // 길이가 8, 10, 11이 아닐 경우
        return false;
    }
}





/**
 * 이미지 업로드 액션 생성 함수
 *
 * @param {string} back_api - 백엔드 API 주소
 * @param {function} callback - 업로드 후 처리할 콜백 함수 (err, result) => {}
 * @param {object} options - 추가 옵션: { folder: "폴더명", maxWidth: 숫자 }
 * @returns {function} - 업로드 실행 함수
 */
const uploadImageAct = (back_api_url, callback, options = {}) => {

    console.log('함수 진입은 해??');

    const folder = options.folder || "testfolder2";
    // const maxWidthOrHeight = options.maxWidth || 1200;

    const input = document.createElement("input");
    console.log(input);

    input.setAttribute("type", "file");
    input.setAttribute("accept", ".png,.jpg,.jpeg,.webp");
    input.click();

    input.onchange = async (e) => {
        const imageFile = e.target.files[0];
        const options = {
            maxSizeMB: 1, // 최대 파일 크기 (MB)
            // maxWidthOrHeight: 1024, // 최대 너비 또는 높이
            useWebWorker: true, // 웹 워커 사용
        };

        try {
            const compressedFile = await imageCompression(
                imageFile,
                options,
            );

            let imgForm = new FormData();
            const timestamp = new Date().getTime();
            const fileName = `${timestamp}${Math.random()
                .toString(36)
                .substring(2, 11)}.${compressedFile.name.split(".")[1]}`;

            console.log(fileName);

            imgForm.append("folder", folder);
            imgForm.append("onimg", compressedFile, fileName);

            // FormData의 key 값과 value값 찾기
            // let keys = imgForm.keys();
            // for (const pair of keys) {
            //     console.log(`name : ${pair}`);
            // }

            // let values = imgForm.values();
            // for (const pair of values) {
            //     console.log(`value : ${pair}`);
            // }

            const res = await axios.post(
                back_api_url,
                imgForm,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );

            console.log(res);
            if (typeof callback === "function") {
                callback(null, res.data);
            }
        } catch (err) {
            const m = err.response?.data?.message;
            if (typeof callback === "function") {
                callback(err, null);
            }
        }
    };


}

export default uploadImageAct;
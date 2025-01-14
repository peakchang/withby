import { goto } from "$app/navigation";

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
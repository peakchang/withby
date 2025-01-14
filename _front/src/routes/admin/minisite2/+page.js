import axios from "axios";
import { back_api } from "$lib/const.js";
import { getPagination } from "$lib/lib.js"

// 사이트 접속시 user_info store 값에 user 정보 넣기
export const load = async ({ params, url, data }) => {

    let minisiteData = [];
    try {
        const res = await axios.post(`${back_api}/minisite/load_land_minisite`)
        if (res.status == 200) {
            minisiteData = res.data.land_minisite_data;
            // pageArr = getPagination(parseInt(nowPage), res.data.allPage);
        }
    } catch (err) {
        console.error(err.message);

    }

    return { minisiteData }
}
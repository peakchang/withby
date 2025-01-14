

import axios from "axios";
import { back_api } from "$lib/const.js";
import { getPagination } from "$lib/lib.js"
import moment from "moment-timezone";
import { user_info } from "$src/lib/store.js";

// 사이트 접속시 user_info store 값에 user 정보 넣기
export const load = async ({ params, url, data }) => {

    let siteList = [];
    try {
        const res = await axios.post(`${back_api}/adminbase/dbupload_site_list`)
        if (res.status == 200) {
            siteList = res.data.site_list;
        }
    } catch (error) {

    }

    return { siteList }
}


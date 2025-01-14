import axios from "axios";
import { back_api } from "$lib/const.js";
import { getPagination } from "$lib/lib.js"

// 사이트 접속시 user_info store 값에 user 정보 넣기
export const load = async ({ params, url, data }) => {

    let footerData = {}
    try {
        const res = await axios.get(`${back_api}/main/load_footer`)
        if (res.status === 200) {
            footerData = res.data.footerData
        }
    } catch (error) {

    }


    return { footerData }
}
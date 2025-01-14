import { user_info } from "$lib/store.js";
import { back_api } from "$src/lib/const.js";
import axios from 'axios';

// 사이트 접속시 user_info store 값에 user 정보 넣기
export const load = async ({ params, url, data, cookies }) => {

    let user_status = false;

    user_info.subscribe(e => {
        if (e.id) {
            user_status = true;
        }
    })



    let minisiteData = {}
    try {
        const res = await axios.post(`${back_api}/main/load_minisite_info`, { hy_id: params.id, user_status })
        if (res.status == 200) {
            minisiteData = res.data.minisite_data
        }
    } catch (error) {

    }

    return { minisiteData }
}
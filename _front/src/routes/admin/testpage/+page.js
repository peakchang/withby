import axios from "axios";
import { back_api } from "$lib/const.js";
import { getPagination } from "$lib/lib.js"


// 사이트 접속시 user_info store 값에 user 정보 넣기
export const load = async ({ params, url, data }) => {
    const nowPage = url.searchParams.get('page') || 1;
    
    let pageArr = []
    let user_datas = [];
    try {
        const res = await axios.post(`${back_api}/usermanage/load_users`, { nowPage })        
        if (res.status == 200) {
            user_datas = res.data.user_datas
            pageArr = getPagination(parseInt(nowPage), res.data.allPage);
        }
    } catch (error) {

    }
    return { user_datas, pageArr }
}
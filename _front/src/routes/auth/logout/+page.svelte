<script>
    import axios from "axios";
    import { back_api } from "$lib/const.js";
    import { goto } from "$app/navigation";
    import { user_info } from "$lib/store.js";

    $effect(async () => {

        if ($user_info.id) {
            try {
                const res = await axios.post(
                    `${back_api}/auth/logout`,
                    {
                        userid: $user_info.id,
                    },
                    { withCredentials: true },
                );

                if (res.status == 200) {
                    $user_info = {};
                    alert('로그아웃이 완료 되었습니다.')
                    goto("/"); // 로그아웃 후 로그인 페이지로 이동
                } else {
                    console.error("Logout failed");
                }
            } catch (error) {
                
                console.error("Network error during logout:", error);
            }
        }else{
            goto("/"); // 로그아웃 후 로그인 페이지로 이동
        }
    });
</script>

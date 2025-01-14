<script>
    import {
        admin_sidebar,
        admin_sidebar_width,
        user_info,
    } from "$src/lib/store";
    import Drawer from "$lib/components/Drawer.svelte";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";

    console.log($user_info);
    

    let innerWidth;
    const width = 192;

    $: {
        if (innerWidth < 1000) {
            $admin_sidebar = false;
            $admin_sidebar_width = false;
        } else {
            $admin_sidebar = true;
            $admin_sidebar_width = true;
        }
    }

    onMount(() => {
        if (Object.keys($user_info).length === 0) {
            alert("로그인이 필요합니다.");
            goto(`/auth/login?url=${$page.url.pathname}`);
        }
    });
</script>

<svelte:window bind:innerWidth />

<div
    class="fixed top-0 left-0 w-full bg-stone-300 py-2 px-6 suit-font z-30 flex items-center pretendard"
    class:ml-48={$admin_sidebar && $admin_sidebar_width}
>
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button on:click={() => ($admin_sidebar = !$admin_sidebar)}>
        <i class="fa fa-bars" aria-hidden="true"></i>
    </button>

    <!-- svelte-ignore a11y_consider_explicit_label -->
    <a href="/" class="mx-5">
        <i class="fa fa-home text-xl" aria-hidden="true"></i>
    </a>

    <span class="text-sm">{$user_info.name}님 반갑습니다.</span>

    <a
        href="/auth/logout"
        class="ml-2 text-xs px-2 py-1 bg-red-400 rounded-md text-white"
    >
        로그아웃
    </a>
</div>

<Drawer drawerOpen={$admin_sidebar} bgGray={false} {width}>
    <div class="flex justify-between mb-5">
        <div>Admin</div>
        <div>
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button
                on:click={() => {
                    $admin_sidebar = false;
                }}
            >
                <i class="fa fa-times" aria-hidden="true"></i>
            </button>
        </div>
    </div>

    {#if $user_info.rate >= 5}
        <a data-sveltekit-preload-data="tap" href="/admin">
            <div class="p-2 hover:bg-gray-100 rounded-md mb-1 text-sm">
                <span class="mr-1">
                    <i class="fa fa-cog" aria-hidden="true"></i>
                </span>
                <span> 기본설정 </span>
            </div>
        </a>

        <a data-sveltekit-preload-data="tap" href="/admin/minisite1">
            <div class="p-2 hover:bg-gray-100 rounded-md mb-1 text-sm">
                <span class="mr-1">
                    <i class="fa fa-home" aria-hidden="true"></i>
                </span>
                <span> 미니사이트1 </span>
            </div>
        </a>

        <a data-sveltekit-preload-data="tap" href="/admin/minisite2">
            <div class="p-2 hover:bg-gray-100 rounded-md mb-1 text-sm">
                <span class="mr-1">
                    <i class="fa fa-home" aria-hidden="true"></i>
                </span>
                <span> 미니사이트2 </span>
            </div>
        </a>

        <a data-sveltekit-preload-data="tap" href="/admin/dbcount">
            <div class="p-2 hover:bg-gray-100 rounded-md mb-1 text-sm">
                <span class="mr-1">
                    <i class="fa fa-list-ol" aria-hidden="true"></i>
                </span>
                <span> DB 갯수 체크 </span>
            </div>
        </a>

        <a data-sveltekit-preload-data="tap" href="/admin/usermanage">
            <div class="p-2 hover:bg-gray-100 rounded-md mb-1 text-sm">
                <span class="mr-1">
                    <i class="fa fa-users" aria-hidden="true"></i>
                </span>
                <span> 회원관리 </span>
            </div>
        </a>

        <a data-sveltekit-preload-data="tap" href="/admin/dbupload">
            <div class="p-2 hover:bg-gray-100 rounded-md mb-1 text-sm">
                <span class="mr-1">
                    <i class="fa fa-upload" aria-hidden="true"></i>
                </span>
                <span> DB 업로드 </span>
            </div>
        </a>

        <a data-sveltekit-preload-data="tap" href="/admin/alldb">
            <div class="p-2 hover:bg-gray-100 rounded-md mb-1 text-sm">
                <span class="mr-1">
                    <i class="fa fa-table" aria-hidden="true"></i>
                </span>
                <span> 전체 DB </span>
            </div>
        </a>
    {/if}

    <a href="/admin/managerdb">
        <div class="p-2 hover:bg-gray-100 rounded-md mb-1 text-sm">
            <span class="mr-1">
                <i class="fa fa-database" aria-hidden="true"></i>
            </span>
            <span> 접수 DB </span>
        </div>
    </a>

    <a href="/admin/myinfomanage">
        <div class="p-2 hover:bg-gray-100 rounded-md mb-1 text-sm">
            <span class="mr-1">
                <i class="fa fa-user" aria-hidden="true"></i>
            </span>
            <span> 내 정보 변경 </span>
        </div>
    </a>
</Drawer>

<div
    class="mt-14 px-2 text-sm suit-font"
    class:ml-52={$admin_sidebar && $admin_sidebar_width}
>
    <slot />
</div>

<style>
    .side-menu {
        padding: 8px 0px;
        font-size: 16px;
    }
</style>

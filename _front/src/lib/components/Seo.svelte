<script>
    let { seoValue } = $props();

    console.log("?????");

    console.log(seoValue);

    // export let seoValue;
</script>

<!-- title,description,keywords,description,url,main -->

<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta
    name="facebook-domain-verification"
    content="hfcyr4o7sysuuo31cswpzaz70ie0uf"
/>
<title>{seoValue.title}</title>
<meta name="title" content={seoValue.title} />

{#if seoValue.description}
    <meta name="description" content={seoValue.description} />
{/if}

<meta name="NaverBot" content="All" />
<meta name="NaverBot" content="index,follow" />
<meta name="Yeti" content="All" />
<meta name="Yeti" content="index,follow" />
<meta name="robots" content="max-image-preview:large" />
<meta name="generator" content="All in One SEO (AIOSEO) 4.2.3.1 " />
<meta
    name="naver-site-verification"
    content="eac9d4ee9921a03f4f6dd6b674d702dab852a08f"
/>
<meta name="keywords" content={seoValue.keywords} />
<meta itemprop="image" content="/logo.png" />

{#if seoValue.description}
<meta itemprop="description" content={seoValue.description} />
{/if}

<meta itemprop="url" content={seoValue.url} />
<meta itemprop="keywords" content={seoValue.keywords} />
<meta property="article:published_time" content="2021-11-29T05:48:25+00:00" />
<meta property="article:modified_time" content="2022-11-3T09:39:40+00:00" />
<meta property="og:locale" content="ko_KR" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content={seoValue.title} />
<meta property="og:title" content={seoValue.title} />
<meta property="og:description" content={seoValue.description} />
<meta property="og:url" content={seoValue.url} />
<meta property="og:image" content="/logo.png" />
<meta property="description" content={seoValue.description} />

<!-- <meta property="og:url" content={seoValue.url} /> -->
<!-- <meta property="og:description" content={seoValue.description} /> -->
<!-- <meta property="og:image" content={seoValue.image} /> -->

<!-- {#if seoValue.date}
    <meta name="date" content={seoValue.date} />
{/if}

{#if seoValue.published_time}
    <meta property="article:published_time" content={seoValue.published_time} />
{/if}
<meta
    name="naver-site-verification"
    content="e76e91aceb433f2f606f921a42335f78cfaa0996"
/> -->

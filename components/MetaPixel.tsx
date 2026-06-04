"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { pageview } from "@/lib/marketing/metaPixel";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const EXCLUDED_PATH_PREFIXES = ["/admin", "/dashboard"];

export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);

  const search = searchParams?.toString() ?? "";
  const shouldSkip = isExcludedPath(pathname);

  useEffect(() => {
    if (!META_PIXEL_ID || !ready || shouldSkip) return;
    pageview();
  }, [pathname, ready, search, shouldSkip]);

  if (!META_PIXEL_ID || shouldSkip) return null;

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      onReady={() => setReady(true)}
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', ${JSON.stringify(META_PIXEL_ID)});
        `,
      }}
    />
  );
}

function isExcludedPath(pathname: string | null) {
  if (!pathname) return true;
  return EXCLUDED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

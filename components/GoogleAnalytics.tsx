"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { pageview } from "@/lib/marketing/ga";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const EXCLUDED_PATH_PREFIXES = ["/admin", "/dashboard"];

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);

  const search = searchParams?.toString() ?? "";
  const shouldSkip = isExcludedPath(pathname);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !ready || shouldSkip || !pathname) return;
    pageview(`${pathname}${search ? `?${search}` : ""}`);
  }, [pathname, ready, search, shouldSkip]);

  if (!GA_MEASUREMENT_ID || shouldSkip) return null;

  return (
    <>
      <Script
        id="ga-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga-init"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', ${JSON.stringify(GA_MEASUREMENT_ID)}, { send_page_view: false });
          `,
        }}
      />
    </>
  );
}

function isExcludedPath(pathname: string | null) {
  if (!pathname) return true;
  return EXCLUDED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

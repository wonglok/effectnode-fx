import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* <script
          //
          async
          src="//cdn.8thwall.com/web/xrextras/xrextras.js"
        ></script>
        <script
          async
          src="//cdn.8thwall.com/web/landing-page/landing-page.js"
        ></script>
        <script
          async
          src="//apps.8thwall.com/xrweb?appKey=[YOUR_API_TOKEN_HERE]"
        ></script> */}
        <div
          id="jsremote"
          dangerouslySetInnerHTML={{
            __html: `
          <script>
          window.remoteImport = (v) => import(v);
          </script>
          `,
          }}
        ></div>
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

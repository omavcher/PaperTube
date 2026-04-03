"use client";
import React, { useEffect, useRef } from "react";

export function AdBanner({ dataKey, width, height }: { dataKey: string, width: number, height: number }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
            <head>
              <style>body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }</style>
            </head>
            <body>
              <script type="text/javascript">
                var atOptions = {
                  'key' : '${dataKey}',
                  'format' : 'iframe',
                  'height' : ${height},
                  'width' : ${width},
                  'params' : {}
                };
              </script>
              <script type="text/javascript" src="https://controlslaverystuffing.com/${dataKey}/invoke.js"></script>
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [dataKey, width, height]);

  return (
    <div className="flex justify-center items-center my-6 overflow-hidden w-full h-full min-h-[50px]">
      <iframe
        ref={iframeRef}
        width={width}
        height={height}
        style={{ border: "none", overflow: "hidden", maxWidth: "100%" }}
        scrolling="no"
        title="Advertisement"
      />
    </div>
  );
}

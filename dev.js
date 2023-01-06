const esbuild = require("esbuild");
const { createServer, request } = require("http");
const ip = require("ip");
const chalk = require("chalk");

const clients = [];

esbuild
  .build({
    entryPoints: {
      app: "src/index.js",
    },
    format: "iife",
    bundle: true,
    outdir: "public",
    banner: {
      js: `(() => {
      new EventSource("/event.sse").onmessage = (e) => {
        window.location.reload()
      }
    })();`,
    },
    watch: {
      onRebuild(error, result) {
        clients.forEach((res) => {
          res.write("data: update\n\n");
        });
        clients.length = 0;
        console.log(
          error ? error : `\n文件更改了 ${new Date().toTimeString()}`
        );
      },
    },
  })
  .catch(() => process.exit(1));

esbuild
  .serve(
    {
      servedir: "public",
      port: 8888,
      host: "0.0.0.0",
    },
    {}
  )
  .then((serve) => {
    const { host: hostname, port } = serve;

    createServer((req, res) => {
      const { url, method, headers } = req;

      if (url === "/event.sse") {
        return clients.push(
          res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          })
        );
      }

      const path = ~url.split("/").pop().indexOf(".") ? url : "/index.html";

      req.pipe(
        request(
          {
            hostname,
            port,
            path,
            method,
            headers,
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
          }
        ),
        {
          end: true,
        }
      );
    }).listen(port);

    console.log(`
  服务已启动：
  - ${chalk.green(`http://localhost:${port}`)}
  - ${chalk.green(`http://${ip.address()}:${port}`)}
  `);
  });

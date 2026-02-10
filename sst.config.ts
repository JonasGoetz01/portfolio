/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "ultimate-nextjs-example",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        cloudflare: true,
      },
    };
  },
  async run() {
    const site = new sst.aws.Nextjs("portfolio", {
    path: "portfolio",
    dev: {
      autostart: true,
      directory: "portfolio",
      command: "bun run dev",
    },
      domain: {
        name: "goetz.sh",
        dns: sst.cloudflare.dns(),
      },
    });

    // Workaround for SST bug #6198: AWS Lambda requires both lambda:InvokeFunctionUrl 
    // AND lambda:InvokeFunction for Function URLs (Oct 2025+). SST only adds the first one.
    
    // Add missing permission for the server function
    const serverFn = site.nodes.server;
    if (serverFn) {
      new aws.lambda.Permission("ServerPublicInvoke", {
        action: "lambda:InvokeFunction",
        function: serverFn.apply(fn => fn.nodes.function.name),
        principal: "*",
        statementId: "AllowPublicInvoke",
      });
    }

    return {
      url: site.url,
    };
  },
});

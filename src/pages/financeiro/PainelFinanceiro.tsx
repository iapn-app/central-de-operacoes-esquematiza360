11:43:00.164 Running build in Washington, D.C., USA (East) – iad1
11:43:00.164 Build machine configuration: 2 cores, 8 GB
11:43:00.323 Cloning github.com/iapn-app/central-de-operacoes-esquematiza360 (Branch: main, Commit: 32c1f02)
11:43:00.693 Cloning completed: 370.000ms
11:43:01.120 Restored build cache from previous deployment (EbUFGx2K18xBqD3qEEKwUq4f9sxa)
11:43:01.466 Running "vercel build"
11:43:02.095 Vercel CLI 50.37.1
11:43:02.746 Installing dependencies...
11:43:03.921 
11:43:03.922 up to date in 879ms
11:43:03.923 
11:43:03.923 128 packages are looking for funding
11:43:03.923   run `npm fund` for details
11:43:03.954 Running "npm run build"
11:43:04.060 
11:43:04.060 > react-example@0.0.0 build
11:43:04.061 > vite build
11:43:04.061 
11:43:04.460 [36mvite v6.4.1 [32mbuilding for production...[36m[39m
11:43:04.559 transforming...
11:43:09.606 [32m✓[39m 3028 modules transformed.
11:43:09.608 [31m✗[39m Build failed in 5.11s
11:43:09.609 [31merror during build:
11:43:09.609 [31msrc/App.tsx (20:9): "PainelFinanceiro" is not exported by "src/pages/financeiro/PainelFinanceiro.tsx", imported by "src/App.tsx".[31m
11:43:09.610 file: [36m/vercel/path0/src/App.tsx:20:9[31m
11:43:09.610 [33m
11:43:09.610 18: import { PortalCliente } from "./pages/PortalCliente";
11:43:09.610 19: 
11:43:09.610 20: import { PainelFinanceiro } from "./pages/financeiro/PainelFinanceiro";
11:43:09.611              ^
11:43:09.611 21: import { Lancamentos } from "./pages/financeiro/Lancamentos";
11:43:09.611 22: import { ContasReceber } from "./pages/financeiro/ContasReceber";
11:43:09.611 [31m
11:43:09.612     at getRollupError (file:///vercel/path0/node_modules/rollup/dist/es/shared/parseAst.js:402:41)
11:43:09.612     at error (file:///vercel/path0/node_modules/rollup/dist/es/shared/parseAst.js:398:42)
11:43:09.612     at Module.error (file:///vercel/path0/node_modules/rollup/dist/es/shared/node-entry.js:17040:16)
11:43:09.612     at Module.traceVariable (file:///vercel/path0/node_modules/rollup/dist/es/shared/node-entry.js:17452:29)
11:43:09.613     at ModuleScope.findVariable (file:///vercel/path0/node_modules/rollup/dist/es/shared/node-entry.js:15070:39)
11:43:09.613     at FunctionScope.findVariable (file:///vercel/path0/node_modules/rollup/dist/es/shared/node-entry.js:5673:38)
11:43:09.613     at FunctionBodyScope.findVariable (file:///vercel/path0/node_modules/rollup/dist/es/shared/node-entry.js:5673:38)
11:43:09.614     at Identifier.bind (file:///vercel/path0/node_modules/rollup/dist/es/shared/node-entry.js:5447:40)
11:43:09.614     at CallExpression.bind (file:///vercel/path0/node_modules/rollup/dist/es/shared/node-entry.js:2825:28)
11:43:09.614     at CallExpression.bind (file:///vercel/path0/node_modules/rollup/dist/es/shared/node-entry.js:12179:15)[39m
11:43:09.658 Error: Command "npm run build" exited with 1

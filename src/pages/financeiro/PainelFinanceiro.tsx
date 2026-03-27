11:48:04.513 Running build in Washington, D.C., USA (East) – iad1
11:48:04.513 Build machine configuration: 2 cores, 8 GB
11:48:04.672 Cloning github.com/iapn-app/central-de-operacoes-esquematiza360 (Branch: main, Commit: 5f5c938)
11:48:05.060 Cloning completed: 388.000ms
11:48:05.293 Restored build cache from previous deployment (EbUFGx2K18xBqD3qEEKwUq4f9sxa)
11:48:05.591 Running "vercel build"
11:48:06.378 Vercel CLI 50.37.1
11:48:07.370 Installing dependencies...
11:48:08.466 
11:48:08.467 up to date in 861ms
11:48:08.467 
11:48:08.467 128 packages are looking for funding
11:48:08.468   run `npm fund` for details
11:48:08.499 Running "npm run build"
11:48:08.771 
11:48:08.772 > react-example@0.0.0 build
11:48:08.773 > vite build
11:48:08.773 
11:48:09.272 [36mvite v6.4.1 [32mbuilding for production...[36m[39m
11:48:09.374 transforming...
11:48:10.472 [32m✓[39m 37 modules transformed.
11:48:10.473 [31m✗[39m Build failed in 1.16s
11:48:10.473 [31merror during build:
11:48:10.473 [31m[vite:esbuild] Transform failed with 1 error:
11:48:10.474 /vercel/path0/src/pages/financeiro/PainelFinanceiro.tsx:1:2: ERROR: Expected ";" but found ":"[31m
11:48:10.474 file: [36m/vercel/path0/src/pages/financeiro/PainelFinanceiro.tsx:1:2[31m
11:48:10.474 [33m
11:48:10.474 [33mExpected ";" but found ":"[33m
11:48:10.475 1  |  11:43:00.164 Running build in Washington, D.C., USA (East) – iad1
11:48:10.475    |    ^
11:48:10.475 2  |  11:43:00.164 Build machine configuration: 2 cores, 8 GB
11:48:10.475 3  |  11:43:00.323 Cloning github.com/iapn-app/central-de-operacoes-esquematiza360 (Branch: main, Commit: 32c1f02)
11:48:10.475 [31m
11:48:10.476     at failureErrorWithLog (/vercel/path0/node_modules/vite/node_modules/esbuild/lib/main.js:1467:15)
11:48:10.476     at /vercel/path0/node_modules/vite/node_modules/esbuild/lib/main.js:736:50
11:48:10.476     at responseCallbacks.<computed> (/vercel/path0/node_modules/vite/node_modules/esbuild/lib/main.js:603:9)
11:48:10.476     at handleIncomingPacket (/vercel/path0/node_modules/vite/node_modules/esbuild/lib/main.js:658:12)
11:48:10.477     at Socket.readFromStdout (/vercel/path0/node_modules/vite/node_modules/esbuild/lib/main.js:581:7)
11:48:10.477     at Socket.emit (node:events:508:28)
11:48:10.477     at addChunk (node:internal/streams/readable:563:12)
11:48:10.478     at readableAddChunkPushByteMode (node:internal/streams/readable:514:3)
11:48:10.478     at Readable.push (node:internal/streams/readable:394:5)
11:48:10.478     at Pipe.onStreamRead (node:internal/stream_base_commons:189:23)[39m
11:48:10.507 Error: Command "npm run build" exited with 1

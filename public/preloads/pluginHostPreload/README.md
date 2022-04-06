为了支持VM2，需要替换node_modules/vm2的main.js
(把HOST里面的require改成require:eval('require'))

同时copy contextify.js fixasync.js sandbox.js 到build目录下。
const chokidar = require('chokidar');
const { exec } = require('child_process');

// 監視するファイルやディレクトリのパス
const watchPaths = ['./src/css/','./src/html/','./src/image/','./src/js/','./src/types/', './src/manifest.json','./src/index.tsx'];

// chokidar インスタンスを作成
const watcher = chokidar.watch(watchPaths);

watcher.on('change', (path) => {
  console.log(`File ${path} has been changed`);
  // ファイルが変更されたときの処理: ビルドとアップロード
  exec('yarn build && yarn upload', (err, stdout, stderr) => {
    if (err) {
      // エラーハンドリング
      console.error(`exec error: ${err}`);
      return;
    }
    // 標準出力と標準エラー出力
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
});

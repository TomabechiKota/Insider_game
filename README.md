# Insider_game

Discord上でインサイダーゲームとitoが遊べるbotです


## 詳細

server.jsを https://glitch.com/ 上で、wake_server.gsとwords_update.gsを https://script.google.com/ 上で動作させました

server.jsが起動している間、Discord上でインサイダーゲームとitoで遊ぶことが出来ます。
自身の環境で使いたい場合server.js内639~644行目のprocess.env.DISCORD_BOT_TOKENに自身のbotのアクセストークンを入れてください。(公開しないように気をつけてください)

https://glitch.com/ では(無課金の場合)一定時間メッセージの受信がないとプログラムの実行が停止してしまうため、wake_server.gsで https://script.google.com/ の機能を利用して5分ごとにメッセージを送信しています

words_update.gs はお題のリストの更新用のプログラムです。1行目のexcelFolderIdを変えることで参照するExcelフォルダーを変更できます。

## 参考

[誰でも作れる！Discord Bot（基礎編）](https://note.com/exteoi/n/nf1c37cb26c41)\
上記サイトを参考に作成しました


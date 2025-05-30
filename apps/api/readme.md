フロントエンドの開発にも毎回バックエンドを立ち上げなければならない

そのときモバイルとPCは同じネットワーク内にいる必要があり

その時のPCのIPアドレスを記載する必要がある

.envに

EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3001

このアドレスはPCのアドレス
これを付け加えてそこを自分のIPアドレスに変更する

起動する順番は

apps/apiで

npm run dev

のあと

mobileの中で

npm run start

↑windowsの場合、Windows Defenderによるブロックがされていないか要確認
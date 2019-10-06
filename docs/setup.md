## Setup

node.jsのインストール

```bash
$ curl -L git.io/nodebrew | perl - setup
$ echo 'export PATH=$HOME/.nodebrew/current/bin:$PATH' >> $HOME/.bashrc  # or .zshrc
$ source $HOME/.bashrc
$ node -v
v12.4.0
```

Expoのインストール

```bash
$ npm install -g expo
```

Androidエミュレータを使用する場合はAndroid Studioをインストール，iOSシミュレータを使用する場合はXcodeをインストール

macOSの場合は自動リロードをするためにwatchmanをインストール

```bash
$ brew install watchman
```

クローン&ライブラリのインストール

```bash
$ git clone git@github.com:youichiro/nutfes-shift-native.git
$ cd nutfes-shift-native
$ npm install
```

設定ファイル

```bash
$ cp env_example.json env.json
# env.jsonにログインパスワードとAPIのURLを記入する
```

起動

```bash
$ expo start
# ブラウザで Expo Developer Tools が立ち上がる
# Run on iOS simulator or Run on Android device/emulator をクリックしてシミュレータを起動する
```

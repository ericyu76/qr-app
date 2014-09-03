
call cordova build --release android

REM uncomment to gen key
REM 
REM keytool -genkey -v -keystore my-release-key.keystore -alias qr-app -keyalg RSA -keysize 2048 -validity 10000
REM 

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore -storepass "Aa123456" .\platforms\android\ant-build\HelloCordova-release-unsigned.apk qr-app

zipalign -f -v  4 .\platforms\android\ant-build\HelloCordova-release-unsigned.apk .\platforms\android\ant-build\HelloCordova-release.apk
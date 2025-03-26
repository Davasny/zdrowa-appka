# mitm

```bash
brew install openjdk
pnpm i
```

## Get apk

xapk: https://apkpure.com/zdrowappka/com.pl.benefit_systems_mobile.prod/download

## Change install package

```bash
apk-mitm --wait --tmp-dir ./tmp ZdrowAppka_1.0.1_APKPure.xapk
```

1. Remove from `AndroidManifest.xml`:

```xml
<meta-data android:name="com.synerise.sdk.messaging.notification_icon" android:resource="@null"/>
```

## Install again

```bash
# uninstall old package
adb uninstall com.pl.benefit_systems_mobile.prod
# clean old patch
rm -rf patched
unzip ZdrowAppka_1.0.1_APKPure-patched.xapk -d patched/
adb install-multiple patched/*.apk
```

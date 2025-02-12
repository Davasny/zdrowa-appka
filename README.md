# mitm

```bash
brew install openjdk
pnpm i
```

## Get apk

### Fetched only single apk (broken)

```bash
adb shell pm list packages -f > packages.txt
adb pull /data/app/~~YLhrArcS2Zm0OiLc6ZAmzQ==/com.pl.benefit_systems_mobile.prod-A926VDhugGzPF1nLwk9_AA==/base.apk
```

`apk-mitm base.apk` result

```
   WARNING 

  This app seems to be using Android App Bundle which means that you
  will likely run into problems installing it. That's because this app
  is made out of multiple APK files and you've only got one of them.

  If you want to patch an app like this with apk-mitm, you'll have to
  supply it with all the APKs. You have two options for doing this:

  – download a *.xapk file (for example from https://apkpure.com​)
  – export a *.apks file (using https://github.com/Aefyr/SAI​)

  You can then run apk-mitm again with that file to patch the bundle.
```

### Download 

xapk: https://apkpure.com/zdrowappka/com.pl.benefit_systems_mobile.prod/download

## Changes

```bash
apk-mitm --wait --tmp-dir ./tmp ZdrowAppka_1.0.1_APKPure.xapk
```

1. Remove from `AndroidManifest.xml`:

```xml
<meta-data android:name="com.synerise.sdk.messaging.notification_icon" android:resource="@null"/>
```

## Install again

```bash
adb uninstall com.pl.benefit_systems_mobile.prod

mkdir patched
mv ZdrowAppka_1.0.1_APKPure-patched.xapk patched/
cd patched/
unzip ZdrowAppka_1.0.1_APKPure-patched.xapk
adb install-multiple *.apk
```

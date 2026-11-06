package com.yuvashaktigroup.app;

import android.app.Activity;
import android.app.DownloadManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Message;
import android.util.Base64;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;

public class MainActivity extends Activity {
    private static final int FILECHOOSER_RESULTCODE = 1001;
    private static final String CHANNEL_ID = "ysg_general_channel";
    private ValueCallback<Uri[]> mFilePathCallback;
    private long mLastBackPressTime = 0;
    private WebView mWebView;

    public class WebAppInterface {
        public WebAppInterface() {}

        @JavascriptInterface
        public void downloadAndInstall(String url, String filename) {
            MainActivity.this.downloadAndInstallApk(url);
        }

        @JavascriptInterface
        public void shareAppApk() {
            MainActivity.this.shareApplicationApk();
        }

        @JavascriptInterface
        public void openWhatsApp(String url) {
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                MainActivity.this.startActivity(intent);
            } catch (Exception e) {
                Toast.makeText(MainActivity.this, "व्हाट्सएप उपलब्ध नहीं है", Toast.LENGTH_SHORT).show();
            }
        }

        @JavascriptInterface
        public void shareText(String text, String title) {
            try {
                Intent intent = new Intent(Intent.ACTION_SEND);
                intent.setType("text/plain");
                intent.putExtra(Intent.EXTRA_TEXT, text);
                MainActivity.this.startActivity(Intent.createChooser(intent, title != null ? title : "शेयर करें"));
            } catch (Exception e) {
                Toast.makeText(MainActivity.this, "शेयर करने में त्रुटि", Toast.LENGTH_SHORT).show();
            }
        }

        @JavascriptInterface
        public void postNotification(String title, String message) {
            MainActivity.this.showSystemNotification(title, message);
        }

        @JavascriptInterface
        public void requestNotificationPermission() {
            MainActivity.this.runOnUiThread(() -> MainActivity.this.checkAndRequestNotificationPermission());
        }

        @JavascriptInterface
        public boolean hasNotificationPermission() {
            return Build.VERSION.SDK_INT < 33 || MainActivity.this.checkSelfPermission("android.permission.POST_NOTIFICATIONS") == 0;
        }
    }

    private void checkAndRequestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != 0) {
            requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 200);
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        checkAndRequestNotificationPermission();
        createNotificationChannel();

        this.mWebView = new WebView(this);
        setContentView(this.mWebView);

        WebSettings settings = this.mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        try {
            settings.setAllowFileAccessFromFileURLs(true);
            settings.setAllowUniversalAccessFromFileURLs(true);
        } catch (Exception e) {}
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setSupportMultipleWindows(true);

        try {
            CookieManager.getInstance().setAcceptThirdPartyCookies(this.mWebView, true);
        } catch (Exception e) {}

        this.mWebView.addJavascriptInterface(new WebAppInterface(), "AndroidApp");

        this.mWebView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
            MainActivity.this.downloadAndInstallApk(url);
        });

        this.mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                WebView.HitTestResult result = view.getHitTestResult();
                String extra = result != null ? result.getExtra() : null;
                if (extra != null) {
                    if (extra.endsWith(".apk") || extra.contains("/releases/download/")) {
                        MainActivity.this.downloadAndInstallApk(extra);
                        return false;
                    }
                    try {
                        MainActivity.this.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(extra)));
                    } catch (Exception e) {}
                    return false;
                }
                return super.onCreateWindow(view, isDialog, isUserGesture, resultMsg);
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (MainActivity.this.mFilePathCallback != null) {
                    MainActivity.this.mFilePathCallback.onReceiveValue(null);
                }
                MainActivity.this.mFilePathCallback = filePathCallback;
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("image/*");
                Intent chooser = new Intent(Intent.ACTION_CHOOSER);
                chooser.putExtra(Intent.EXTRA_INTENT, intent);
                chooser.putExtra(Intent.EXTRA_TITLE, "फोटो चुनें");
                try {
                    MainActivity.this.startActivityForResult(chooser, FILECHOOSER_RESULTCODE);
                    return true;
                } catch (Exception e) {
                    MainActivity.this.mFilePathCallback = null;
                    return false;
                }
            }
        });

        this.mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url == null) return false;

                if (url.startsWith("upi://") || url.startsWith("phonepe://")) {
                    try {
                        MainActivity.this.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                        return true;
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "PhonePe / UPI ऐप नहीं मिला", Toast.LENGTH_SHORT).show();
                        return true;
                    }
                }

                if (url.endsWith(".apk") || url.contains("/releases/download/")) {
                    MainActivity.this.downloadAndInstallApk(url);
                    return true;
                }

                if (url.startsWith("tel:")) {
                    try {
                        MainActivity.this.startActivity(new Intent(Intent.ACTION_DIAL, Uri.parse(url)));
                        return true;
                    } catch (Exception e) {
                        return true;
                    }
                }

                if (url.contains("chat.whatsapp.com") || url.contains("wa.me") || url.contains("api.whatsapp.com")) {
                    try {
                        MainActivity.this.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                        return true;
                    } catch (Exception e) {
                        return true;
                    }
                }

                if (url.startsWith("file:") || url.startsWith("http:") || url.startsWith("https:")) {
                    return false;
                }

                try {
                    MainActivity.this.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }
        });

        this.mWebView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILECHOOSER_RESULTCODE) {
            if (this.mFilePathCallback != null) {
                this.mFilePathCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
                this.mFilePathCallback = null;
            }
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    public void downloadAndInstallApk(final String url) {
        if (url == null || url.trim().isEmpty()) return;

        runOnUiThread(() -> {
            try {
                Toast.makeText(MainActivity.this, "अपडेट डाउनलोड शुरू हो रहा है...", Toast.LENGTH_SHORT).show();

                if (Build.VERSION.SDK_INT >= 26 && !getPackageManager().canRequestPackageInstalls()) {
                    try {
                        startActivity(new Intent("android.settings.MANAGE_UNKNOWN_APP_SOURCES", Uri.parse("package:" + getPackageName())));
                        Toast.makeText(MainActivity.this, "कृपया ऐप अपडेट इंस्टॉल की अनुमति दें", Toast.LENGTH_LONG).show();
                    } catch (Exception e) {}
                }

                DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
                DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                request.setTitle("युवा शक्ति ग्रुप ऐप अपडेट");
                request.setDescription("नया ऐप अपडेट डाउनलोड हो रहा है...");
                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setMimeType("application/vnd.android.package-archive");
                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "YuvaShaktiGroup_Update.apk");

                final long downloadId = dm.enqueue(request);

                BroadcastReceiver onComplete = new BroadcastReceiver() {
                    @Override
                    public void onReceive(Context context, Intent intent) {
                        long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                        if (id == downloadId) {
                            try {
                                MainActivity.this.unregisterReceiver(this);
                            } catch (Exception e) {}

                            try {
                                Uri apkUri = dm.getUriForDownloadedFile(downloadId);
                                if (apkUri != null) {
                                    Intent install = new Intent(Intent.ACTION_VIEW);
                                    install.setDataAndType(apkUri, "application/vnd.android.package-archive");
                                    install.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                                    MainActivity.this.startActivity(install);
                                    Toast.makeText(MainActivity.this, "इंस्टॉल स्क्रीन खुल रही है, 'Install' दबाएं", Toast.LENGTH_LONG).show();
                                }
                            } catch (Exception ex) {
                                Toast.makeText(MainActivity.this, "अपडेट फाइल डाउनलोड हो चुकी है, Downloads में जाकर टैप करें।", Toast.LENGTH_LONG).show();
                            }
                        }
                    }
                };

                if (Build.VERSION.SDK_INT >= 33) {
                    registerReceiver(onComplete, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE), Context.RECEIVER_EXPORTED);
                } else {
                    registerReceiver(onComplete, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));
                }
            } catch (Exception e) {
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                } catch (Exception ex) {
                    Toast.makeText(MainActivity.this, "डाउनलोड त्रुटि: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            }
        });
    }

    public void shareApplicationApk() {
        try {
            String sourceDir = getApplicationInfo().sourceDir;
            File srcFile = new File(sourceDir);
            File cacheDir = new File(getCacheDir(), "shared_apks");
            if (!cacheDir.exists()) cacheDir.mkdirs();
            File destFile = new File(cacheDir, "YuvaShaktiGroup.apk");

            FileInputStream in = new FileInputStream(srcFile);
            FileOutputStream out = new FileOutputStream(destFile);
            byte[] buf = new byte[8192];
            int len;
            while ((len = in.read(buf)) > 0) {
                out.write(buf, 0, len);
            }
            in.close();
            out.close();

            Uri uri = Uri.parse("content://com.yuvashaktigroup.app.fileprovider/shared_apks/YuvaShaktiGroup.apk");
            Intent share = new Intent(Intent.ACTION_SEND);
            share.setType("application/vnd.android.package-archive");
            share.putExtra(Intent.EXTRA_STREAM, uri);
            share.putExtra(Intent.EXTRA_SUBJECT, "युवा शक्ति ग्रुप (भाटी परिवार • कुचेरा) Android App");
            share.putExtra(Intent.EXTRA_TEXT, "🚩 युवा शक्ति ग्रुप (भाटी परिवार • कुचेरा) का आधिकारिक Android ऐप। डाउनलोड कर अपने फोन में इंस्टॉल करें।");
            share.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivity(Intent.createChooser(share, "APK व्हाट्सएप पर भेजें"));
        } catch (Exception e) {
            Toast.makeText(this, "APK शेयर करने में असमर्थ: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "युवा शक्ति ग्रुप सूचनाएं",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("मासिक अमावस्या, बही-खाता एवं दैनिक सुविचार अलर्ट");
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) {
                nm.createNotificationChannel(channel);
            }
        }
    }

    public void showSystemNotification(String title, String message) {
        try {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            Intent intent = new Intent(this, MainActivity.class);
            PendingIntent pi = PendingIntent.getActivity(
                this, 0, intent,
                Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0
            );

            android.app.Notification.Builder builder;
            if (Build.VERSION.SDK_INT >= 26) {
                builder = new android.app.Notification.Builder(this, CHANNEL_ID);
            } else {
                builder = new android.app.Notification.Builder(this);
            }

            builder.setContentTitle(title)
                .setContentText(message)
                .setSmallIcon(getApplicationInfo().icon)
                .setContentIntent(pi)
                .setAutoCancel(true);

            if (nm != null) {
                nm.notify((int) System.currentTimeMillis(), builder.build());
            }
        } catch (Exception e) {}
    }

    @Override
    public void onBackPressed() {
        if (this.mWebView != null && this.mWebView.canGoBack()) {
            this.mWebView.goBack();
            return;
        }
        long now = System.currentTimeMillis();
        if (now - this.mLastBackPressTime < 2000) {
            super.onBackPressed();
        } else {
            this.mLastBackPressTime = now;
            Toast.makeText(this, "बाहर निकलने के लिए एक बार फिर 'Back' दबाएं", Toast.LENGTH_SHORT).show();
        }
    }
}

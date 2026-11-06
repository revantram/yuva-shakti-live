package com.yuvashaktigroup.app;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import java.io.File;
import java.io.FileNotFoundException;

public class AppFileProvider extends ContentProvider {
    public static final String AUTHORITY = "com.yuvashaktigroup.app.fileprovider";

    @Override
    public boolean onCreate() {
        return true;
    }

    @Override
    public Cursor query(Uri uri, String[] projection, String selection, String[] selectionArgs, String sortOrder) {
        if (projection == null) {
            projection = new String[]{"_display_name", "_size"};
        }
        MatrixCursor cursor = new MatrixCursor(projection);
        File file = getFileForUri(uri);
        if (file != null && file.exists()) {
            Object[] row = new Object[projection.length];
            for (int i = 0; i < projection.length; i++) {
                if ("_display_name".equals(projection[i])) {
                    row[i] = file.getName();
                } else if ("_size".equals(projection[i])) {
                    row[i] = file.length();
                }
            }
            cursor.addRow(row);
        }
        return cursor;
    }

    @Override
    public String getType(Uri uri) {
        String path = uri.getPath();
        if (path != null && path.endsWith(".apk")) {
            return "application/vnd.android.package-archive";
        }
        if (path != null && (path.endsWith(".jpg") || path.endsWith(".jpeg"))) {
            return "image/jpeg";
        }
        if (path != null && path.endsWith(".png")) {
            return "image/png";
        }
        if (path != null && path.endsWith(".pdf")) {
            return "application/pdf";
        }
        return "application/octet-stream";
    }

    @Override
    public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        File file = getFileForUri(uri);
        if (file != null && file.exists()) {
            return ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY);
        }
        throw new FileNotFoundException("File not found: " + uri);
    }

    @Override
    public int delete(Uri uri, String selection, String[] selectionArgs) {
        File file = getFileForUri(uri);
        return (file != null && file.delete()) ? 1 : 0;
    }

    @Override
    public Uri insert(Uri uri, ContentValues values) {
        return null;
    }

    @Override
    public int update(Uri uri, ContentValues values, String selection, String[] selectionArgs) {
        return 0;
    }

    private File getFileForUri(Uri uri) {
        String path = uri.getPath();
        if (path == null) return null;
        if (path.startsWith("/")) {
            path = path.substring(1);
        }
        if (getContext() != null) {
            File cacheFile = new File(getContext().getCacheDir(), path);
            if (cacheFile.exists()) return cacheFile;
            File filesDirFile = new File(getContext().getFilesDir(), path);
            if (filesDirFile.exists()) return filesDirFile;
        }
        return new File(path);
    }
}

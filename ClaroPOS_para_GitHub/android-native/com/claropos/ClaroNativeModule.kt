package com.claropos

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.annotation.SuppressLint
import android.os.Handler
import android.os.Looper
import android.provider.Telephony
import android.telephony.TelephonyManager
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * Módulo nativo: marcación USSD directa, listener de SMS y lectura del inbox.
 * Permisos requeridos: CALL_PHONE, READ_SMS, RECEIVE_SMS.
 */
class ClaroNativeModule(private val rc: ReactApplicationContext) : ReactContextBaseJavaModule(rc) {

    private var receiver: BroadcastReceiver? = null

    override fun getName() = "ClaroNative"

    /** Intent ACTION_CALL con '#' codificado como %23 (Uri.encode("#") == "%23"). */
    @ReactMethod
    fun dial(ussd: String, promise: Promise) {
        try {
            val uri = Uri.parse("tel:" + ussd.replace("#", Uri.encode("#")))
            val intent = Intent(Intent.ACTION_CALL, uri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            rc.startActivity(intent)
            promise.resolve(true)
        } catch (e: SecurityException) {
            promise.reject("NO_PERMISSION", "Falta el permiso CALL_PHONE", e)
        } catch (e: Exception) {
            promise.reject("DIAL_ERROR", e.message, e)
        }
    }

    /**
     * Envía el USSD con TelephonyManager.sendUssdRequest (Android 8+) y devuelve el texto de respuesta.
     * Es un CALLBACK: Android nos avisa cuando el operador responde y entonces resolvemos la promesa.
     */
    @SuppressLint("MissingPermission")
    @ReactMethod
    fun sendUssd(ussd: String, promise: Promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            promise.reject("UNSUPPORTED", "Requiere Android 8 o superior")
            return
        }
        try {
            val tm = rc.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
            tm.sendUssdRequest(ussd, object : TelephonyManager.UssdResponseCallback() {
                override fun onReceiveUssdResponse(t: TelephonyManager, request: String, response: CharSequence) {
                    promise.resolve(response.toString())
                }
                override fun onReceiveUssdResponseFailed(t: TelephonyManager, request: String, failureCode: Int) {
                    promise.reject("USSD_FAILED", "El operador no respondió (código $failureCode)")
                }
            }, Handler(Looper.getMainLooper()))
        } catch (e: SecurityException) {
            promise.reject("NO_PERMISSION", "Falta el permiso CALL_PHONE", e)
        } catch (e: Exception) {
            promise.reject("USSD_ERROR", e.message, e)
        }
    }

    /** Registra un BroadcastReceiver (listener) para SMS entrantes y emite 'onSmsReceived' a JS. */
    @ReactMethod
    fun startSmsListener() {
        if (receiver != null) return
        receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                val parts = Telephony.Sms.Intents.getMessagesFromIntent(intent) ?: return
                if (parts.isEmpty()) return
                // Un SMS largo llega en varias partes: se unen por remitente.
                val body = parts.joinToString("") { it.messageBody ?: "" }
                val map = Arguments.createMap().apply {
                    putString("address", parts[0].originatingAddress ?: "")
                    putString("body", body)
                    putDouble("date", System.currentTimeMillis().toDouble())
                }
                rc.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onSmsReceived", map)
            }
        }
        val filter = IntentFilter("android.provider.Telephony.SMS_RECEIVED").apply { priority = 999 }
        if (Build.VERSION.SDK_INT >= 33) rc.registerReceiver(receiver, filter, Context.RECEIVER_EXPORTED)
        else rc.registerReceiver(receiver, filter)
    }

    @ReactMethod
    fun stopSmsListener() {
        receiver?.let { try { rc.unregisterReceiver(it) } catch (_: Exception) {} }
        receiver = null
    }

    /** Lee el inbox (últimos 200 SMS posteriores a sinceMillis) para sincronizar lo recibido con la app cerrada. */
    @ReactMethod
    fun readInbox(sinceMillis: Double, promise: Promise) {
        try {
            val out = Arguments.createArray()
            rc.contentResolver.query(
                Uri.parse("content://sms/inbox"),
                arrayOf("address", "body", "date"),
                "date > ?", arrayOf(sinceMillis.toLong().toString()),
                "date DESC LIMIT 200"
            )?.use { c ->
                while (c.moveToNext()) {
                    out.pushMap(Arguments.createMap().apply {
                        putString("address", c.getString(0) ?: "")
                        putString("body", c.getString(1) ?: "")
                        putDouble("date", c.getLong(2).toDouble())
                    })
                }
            }
            promise.resolve(out)
        } catch (e: SecurityException) {
            promise.reject("NO_PERMISSION", "Falta el permiso READ_SMS", e)
        } catch (e: Exception) {
            promise.reject("READ_ERROR", e.message, e)
        }
    }

    // Requeridos por NativeEventEmitter
    @ReactMethod fun addListener(eventName: String) {}
    @ReactMethod fun removeListeners(count: Int) {}
}

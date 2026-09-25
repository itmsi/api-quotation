/**
 * Loki Request Logger Middleware
 *
 * Middleware Express untuk structured request/response logging ke Grafana Loki
 * sekaligus mencatat setiap request ke tabel `log_activities`.
 * Fitur:
 *  - Inject trace_id (UUID) per request
 *  - Log lengkap: method, url, status_code, duration_ms, request_body, response_body
 *  - Auto-generate cURL string dari request masuk
 *  - Masking data sensitif (password, token, authorization)
 *  - Batasi ukuran body log maksimal 500KB
 *  - Insert row `log_activities` saat request masuk, lalu update saat response selesai
 *  - Non-blocking (Pino async transport)
 */

const { v4: uuidv4 } = require('uuid')
const jwtDecode = require('jwt-decode')
const http = require('http')
const lokiLogger = require('../utils/loki-logger')
const { pgCore: db } = require('../config/database')

const MAX_BODY_SIZE = 512000 // 500KB dalam bytes (Cukup untuk menampung ribuan baris data JSON)
const SENSITIVE_KEYS = new Set([
    'password',
    'token',
    'authorization',
    'client_secret',
    'access_token',
    'refresh_token',
    'secret',
    'api_key',
    'apikey',
    'x-api-key',
])

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Mask value dari field yang dianggap sensitif secara rekursif
 */
const maskSensitiveData = (data) => {
    if (!data || typeof data !== 'object') return data
    const cloned = Array.isArray(data) ? [...data] : { ...data }
    for (const key in cloned) {
        if (SENSITIVE_KEYS.has(key.toLowerCase())) {
            cloned[key] = '***MASKED***'
        } else if (typeof cloned[key] === 'object') {
            cloned[key] = maskSensitiveData(cloned[key])
        }
    }
    return cloned
}

/**
 * Batasi ukuran body objek agar log tidak terlalu besar
 * Jika lebih dari MAX_BODY_SIZE byte, ganti dengan pesan truncated
 */
const limitBodySize = (bodyObj) => {
    if (!bodyObj) return null
    const stringified = typeof bodyObj === 'string' ? bodyObj : JSON.stringify(bodyObj)
    if (Buffer.byteLength(stringified, 'utf8') > MAX_BODY_SIZE) {
        return `[TRUNCATED - exceeds ${MAX_BODY_SIZE / 1024}KB]`
    }
    return bodyObj
}

/**
 * Generate cURL command dari Express Request
 * Header sensitif akan di-mask otomatis
 */
const generateCurl = (req) => {
    try {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http'
        const host = req.headers['host'] || 'localhost'
        // Flat curl (tanpa newline & backslash agar JSON tetap aman)
        let curl = `curl -X ${req.method} '${protocol}://${host}${req.originalUrl}'`

        const sensitiveHeaders = new Set(['authorization', 'x-api-key', 'cookie'])
        for (const [key, value] of Object.entries(req.headers)) {
            if (key.toLowerCase() === 'host') continue
            const safeVal = sensitiveHeaders.has(key.toLowerCase()) ? '***' : value
            curl += ` -H '${key}: ${safeVal}'`
        }

        if (req.body && Object.keys(req.body).length > 0) {
            const safeBody = maskSensitiveData(req.body)
            curl += ` -d '${JSON.stringify(safeBody)}'`
        }

        return curl
    } catch {
        return '[GEN_FAILED]'
    }
}

/**
 * Bangun payload log dari request.
 * Untuk multipart/form-data, req.body diisi oleh multer di route-level (setelah
 * middleware ini jalan), jadi harus dibaca ulang saat 'finish' agar tidak kosong.
 * File yang diupload (req.file / req.files) disertakan sebagai metadata saja
 * (originalname, mimetype, size) - bukan buffer-nya.
 */
const buildPayload = (req) => {
    const fields = req.body && Object.keys(req.body).length > 0 ? maskSensitiveData(req.body) : null

    const toFileMeta = (file) => ({
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
    })

    let files = null
    if (req.file) {
        files = [toFileMeta(req.file)]
    } else if (req.files) {
        files = Array.isArray(req.files)
            ? req.files.map(toFileMeta)
            : Object.values(req.files).flat().map(toFileMeta)
    }

    if (!fields && !files) return null
    return { ...(fields || {}), ...(files ? { files } : {}) }
}

/**
 * Ambil user_id / employee_id dari bearer token di header Authorization.
 * Mengikuti pola yang sudah dipakai di modules lain: employee_id -> user_id -> sub.
 */
const getUserIdFromRequest = (req) => {
    if (req.user) {
        return req.user.employee_id || req.user.user_id || req.user.sub || null
    }
    try {
        const token = req.headers?.authorization?.split(' ')[1]
        if (!token) return null
        const decoded = jwtDecode(token)
        return decoded?.employee_id || decoded?.user_id || decoded?.sub || null
    } catch {
        return null
    }
}

// ─── Middleware ──────────────────────────────────────────────────────────────

const lokiRequestLogger = (req, res, next) => {
    // Best Practice: Jangan log request health check atau metrics agar tidak memenuhi Grafana
    const skipPaths = ['/health', '/metrics', '/favicon.ico']
    if (skipPaths.includes(req.path)) {
        return next()
    }

    const startTime = Date.now()

    // 1. Inject trace_id
    req.traceId = req.headers['x-trace-id'] || uuidv4()
    res.setHeader('x-trace-id', req.traceId)

    // 2. Insert baris awal ke log_activities begitu request masuk
    const userId = getUserIdFromRequest(req)
    const curl = generateCurl(req)

    const insertPayload = {
        url: req.originalUrl,
        method: req.method,
        payload: buildPayload(req),
        curl,
        created_by: userId ? String(userId) : null,
        updated_by: userId ? String(userId) : null,
    }

    const logActivityPromise = db('log_activities')
        .insert(insertPayload)
        .returning('id')
        .then((rows) => rows?.[0]?.id ?? rows?.[0] ?? null)
        .catch((err) => {
            console.error('[ACTIVITY-LOGGER] Error inserting log:', err.message)
            return null
        })

    // 3. Intercept res.send() agar kita bisa capture response body
    const originalSend = res.send.bind(res)
    let capturedResBody

    res.send = function (body) {
        capturedResBody = body
        return originalSend(body)
    }

    // 4. Log saat response selesai dikirim ke client
    res.on('finish', () => {
        const durationMs = Date.now() - startTime
        // Ambil status code asli jika sudah diset (berguna saat dipaksa HTTP 200)
        const statusCode = res.locals.originalStatusCode || res.statusCode

        // Parse response body
        let parsedRes = capturedResBody
        try {
            if (typeof capturedResBody === 'string' && capturedResBody.startsWith('{')) {
                parsedRes = JSON.parse(capturedResBody)
            }
        } catch {
            // Keep original
        }

        // Pastikan body di-stringify agar aman dikirim ke Loki sebagai string, bukan nested object
        const finalReqBody = limitBodySize(maskSensitiveData(req.body))
        const finalResBody = limitBodySize(maskSensitiveData(parsedRes))

        const logPayload = {
            trace_id: String(req.traceId),
            method: req.method,
            url: req.originalUrl,
            status_code: Number(statusCode),
            duration_ms: Number(durationMs),
            // Jika objek, stringify. Jika sudah string (seperti pesan TRUNCATED), biarkan.
            request_body: typeof finalReqBody === 'object' ? JSON.stringify(finalReqBody) : finalReqBody,
            response_body: typeof finalResBody === 'object' ? JSON.stringify(finalResBody) : finalResBody,
            curl,
        }

        // 5. Log ke pino instance
        const logMsg = `HTTP ${req.method} ${req.originalUrl} - ${statusCode}`

        if (statusCode >= 500) {
            lokiLogger.error({ ...logPayload, level_name: 'error' }, logMsg)
        } else if (statusCode >= 400) {
            lokiLogger.warn({ ...logPayload, level_name: 'warn' }, logMsg)
        } else {
            lokiLogger.info({ ...logPayload, level_name: 'info' }, logMsg)
        }

        // 6. Asynchronous DB update (Log Activity) begitu response selesai
        const statusText = http.STATUS_CODES[statusCode] || 'Unknown Status'
        let dbResponse = maskSensitiveData(parsedRes)

        // Inject original unmasked error untuk log DB jika tersedia
        if (res.locals.originalError) {
            const errMsg = typeof res.locals.originalError === 'string'
                ? res.locals.originalError
                : (res.locals.originalError.message || String(res.locals.originalError))

            dbResponse = typeof dbResponse === 'object' && dbResponse !== null
                ? { ...dbResponse, message: errMsg }
                : { message: errMsg }
        }

        // Payload dibaca ulang di sini karena untuk multipart/form-data, req.body
        // dan req.file baru terisi oleh multer di route-level (setelah insert awal).
        const finalPayload = buildPayload(req)

        logActivityPromise.then((logId) => {
            if (!logId) return
            db('log_activities')
                .where({ id: logId })
                .update({
                    ...(finalPayload ? { payload: finalPayload } : {}),
                    status_code: String(statusCode),
                    status: statusText,
                    response: dbResponse,
                    updated_at: db.fn.now(),
                    updated_by: userId ? String(userId) : null,
                })
                .catch((err) => console.error('[ACTIVITY-LOGGER] Error updating log:', err.message))
        })
    })

    next()
}

module.exports = { lokiRequestLogger }

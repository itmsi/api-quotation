/**
 * Loki Logger (Pino)
 * Structured JSON logging dengan transport ke Grafana Loki
 * Non-blocking menggunakan pino transport worker thread
 *
 * Strategy:
 *  - development: pino-pretty (human-readable) + pino-loki (jika enabled)
 *  - production : stdout JSON biasa + pino-loki (lebih efisien di Docker)
 */
const pino = require('pino')

const LOKI_URL = process.env.LOKI_URL || 'http://loki:3100'
const SERVICE_NAME = process.env.SERVICE_NAME || 'netsuite-middleware'
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'
const LOKI_ENABLED = process.env.LOKI_ENABLED !== 'false' // default aktif
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

/**
 * Build transport targets sesuai environment.
 *
 * Di production: tidak gunakan pino-pretty (hemat resource, JSON ke stdout).
 * Di development: gunakan pino-pretty untuk log yang mudah dibaca.
 * pino-loki: selalu aktif jika LOKI_ENABLED=true.
 */
const buildTransportTargets = () => {
    const targets = []

    if (!IS_PRODUCTION) {
        // Development: pino-pretty (berwarna)
        targets.push({
            target: 'pino-pretty',
            level: LOG_LEVEL,
            options: {
                colorize: true,
                translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
                ignore: 'pid,hostname',
            },
        })
    } else {
        // Production: Tetap keluarkan JSON ke stdout agar bisa dilihat di docker logs
        targets.push({
            target: 'pino/file', // pino/file ke fd 1 adalah stdout
            level: LOG_LEVEL,
            options: { destination: 1 }
        })
    }

    // Loki transport (aktif di semua environment jika LOKI_ENABLED=true)
    if (LOKI_ENABLED && LOKI_URL) {
        targets.push({
            target: 'pino-loki',
            level: LOG_LEVEL,
            options: {
                batching: true,
                interval: 5,
                host: LOKI_URL,
                replaceTimestamp: true, // Tambahkan ini agar akurasi waktu lebih baik di Loki
                labels: {
                    service_name: SERVICE_NAME,
                    app: 'api-bridge',
                },
                levelFirst: false,
                ...(process.env.LOKI_BASIC_AUTH && {
                    basicAuth: process.env.LOKI_BASIC_AUTH,
                }),
            },
        })
    }

    return targets
}

const targets = buildTransportTargets()

const createLogger = () => {
    const baseOptions = {
        level: LOG_LEVEL,
        base: {
            env: process.env.NODE_ENV || 'production',
        },
        timestamp: pino.stdTimeFunctions.isoTime,
        serializers: {
            err: pino.stdSerializers.err,
            error: pino.stdSerializers.err,
        },
    }

    if (targets.length === 0) {
        // Fallback: log ke stdout sebagai JSON biasa (production tanpa pino-loki)
        return pino(baseOptions)
    }

    const transport = pino.transport({ targets })
    return pino(baseOptions, transport)
}

const lokiLogger = createLogger()

module.exports = lokiLogger

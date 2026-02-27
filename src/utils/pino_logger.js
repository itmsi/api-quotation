const pino = require('pino');
const { trace, context } = require('@opentelemetry/api');

const pinoLogger = pino({
    level: process.env.LOG_LEVEL || 'info',
    formatters: { level: (label) => ({ level: label }) },
    base: { service_name: process.env.SERVICE_NAME || 'manage-quotation-api' },
    mixin() {
        try {
            if (trace && context) {
                const currentSpan = trace.getSpan(context.active());
                if (currentSpan) {
                    const { traceId, spanId } = currentSpan.spanContext();
                    return { trace_id: traceId, span_id: spanId };
                }
            }
        } catch (e) { }
        return {};
    }
});

module.exports = pinoLogger;

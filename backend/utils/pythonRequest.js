const http = require("http")

const PYTHON_HOST = process.env.PYTHON_HOST || "localhost"
const PYTHON_PORT = parseInt(process.env.PYTHON_PORT) || 7777

function pyRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null
        const req = http.request({
            hostname: PYTHON_HOST, port: PYTHON_PORT, path, method,
            headers: payload
                ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) }
                : {},
        }, res => {
            let chunks = ""
            res.on("data", c => chunks += c)
            res.on("end", () => {
                let parsed
                try { parsed = JSON.parse(chunks) } catch { parsed = { raw: chunks } }
                if (res.statusCode >= 200 && res.statusCode < 300) return resolve(parsed)
                const msg = parsed?.detail || parsed?.raw || `Python server returned ${res.statusCode}`
                const err = new Error(msg); err.status = res.statusCode; reject(err)
            })
        })
        req.on("error", reject)
        if (payload) req.write(payload)
        req.end()
    })
}

module.exports = pyRequest

const axios = require('axios')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const generatePassword = (payload) => {
  try {
    payload.salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(payload.password, payload.salt, 10000, 100, 'sha512').toString('hex')
    payload.password = hash
    return payload
  } catch (error) {
    console.info('error generated password', error)
    return payload
  }
}

const isValidPassword = (password, hash, salt) => {
  try {
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 100, 'sha512').toString('hex')
    return hash === hashPassword
  } catch (error) {
    console.info('error validated password', error)
    return false
  }
}

const setPayloadToken = (result, type = 'admin', column = false) => {
  const roles = type === 'admin' ? 'backoffice' : 'front'
  let sub = ''
  if (type === 'admin') {
    sub = result?.users_id.toString()
  }
  sub = result.users_id
  let full_name = ''
  if (column) {
    full_name = result.full_name
  }
  const jti = crypto.randomUUID();
  const payload = {
      sub,
      full_name,
      roles: [result?.role_name, roles],
      jti: jti,
      exp: Math.floor(new Date(Date.now() + (43200 * 1000)) / 1000)
  };
  const b_token = jwt.sign(payload, process.env.SECRET_KEY_AUTH_JWT, { algorithm: 'HS256' });
  return {
    bearer_token: b_token,
    access_token: {
      sub,
      full_name,
      roles: [result?.role_name, roles],
      jti: crypto.randomUUID(),
      exp: Math.floor(new Date(Date.now() + (43200 * 1000)) / 1000)
    },
    refresh_token: {
      sub,
      full_name,
      roles: [result?.role_name, roles],
      jti: crypto.randomUUID(),
      exp: Math.floor(new Date(Date.now() + (86400 * 1000)) / 1000) // refresh must be > access
    },
    exp: 43200 // 12 hours
  }
}

const resolveUserId = (decoded) => {
  if (!decoded) {
    return null
  }

  return decoded.sub
    ?? decoded.user_id
    ?? decoded.users_id
    ?? decoded.userId
    ?? decoded.usersId
    ?? decoded.id
    ?? null
}

const decodeWithFallback = (token) => {
  if (!token) {
    return null
  }

  const secret = process.env.SECRET_KEY_AUTH_JWT

  if (secret) {
    try {
      return jwt.verify(token, secret)
    } catch (error) {
      const allowFallback = ['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error?.name)

      if (!allowFallback) {
        throw error
      }

      if (process.env.NODE_ENV === 'development') {
        console.warn(`jwt.verify gagal (${error?.name}), jatuh ke jwt.decode: ${error?.message}`)
      }
    }
  }

  const decoded = jwt.decode(token)

  if (!decoded) {
    throw new Error('Gagal decode token JWT')
  }

  return decoded
}

const decodeToken = (type, req) => {
  try {
    const payload = {}
    const tokenHeader = req?.headers?.authorization ?? ''
    
    // Check if token header exists and has Bearer format
    if (!tokenHeader || typeof tokenHeader !== 'string') {
      throw new Error('Authorization header tidak ditemukan atau tidak valid')
    }
    
    const parts = tokenHeader.split(' ')
    if (parts.length < 2 || !parts[1]) {
      throw new Error('Token tidak ditemukan di Authorization header')
    }
    
    const token = parts[1]
    if (!token || token === 'YOUR_TOKEN_HERE' || token.trim() === '') {
      throw new Error('Token tidak valid atau kosong')
    }

    const decode = decodeWithFallback(token)
    const userId = resolveUserId(decode)

    switch (type) {
      case 'created':
        payload.created_by = userId
        break;
      case 'updated':
        payload.updated_by = userId
        payload.updated_at = new Date().toISOString()
        break;
      case 'deleted':
        payload.deleted_by = userId
        payload.deleted_at = new Date().toISOString()
        break;
      case 'default':
        payload.users_id = userId
        break;
      case 'getRoles':
        return decode?.roles ?? []
      case 'refreshToken':
        payload.users_id = userId
        payload.is_admin = decode?.roles.toString() === 'front' ? 0 : 1
        payload.roles = decode?.roles ?? []
        break;
      default:
        return payload
    }
    if (process.env.NODE_ENV === 'development') {
      console.info(`decoded token is : ${JSON.stringify(payload)}`)
    }
    return payload
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`error decoded token : ${error}`)
    }
    
    // Return appropriate default based on type
    const defaultPayload = {
      users_id: '',
      created_by: '',
      updated_by: '',
      deleted_by: '',
      is_admin: 1,
      roles: ['']
    }
    
    // Add type-specific defaults
    switch (type) {
      case 'updated':
        defaultPayload.updated_at = new Date().toISOString()
        break
      case 'deleted':
        defaultPayload.deleted_at = new Date().toISOString()
        break
    }
    
    return defaultPayload
  }
}

const fetchUserInfoByToken = async (token, options = {}) => {
  if (!token) {
    throw new Error('Token bearer tidak ditemukan')
  }

  const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`
  const url = options?.url
    || process.env.SSO_USERINFO_URL
    || 'https://gateway.motorsights.com/api/auth/sso/userinfo'

  const timeout = Number(options?.timeout || process.env.SSO_USERINFO_TIMEOUT || 10000)

  try {
    const response = await axios({
      method: 'GET',
      url,
      headers: {
        Accept: 'application/json',
        Authorization: bearerToken,
        ...options?.headers
      },
      timeout
    })

    return response?.data
  } catch (error) {
    const status = error?.response?.status
    const data = error?.response?.data
    const message = typeof data === 'string' ? data : JSON.stringify(data)

    const err = new Error(`Gagal mengambil data userinfo SSO${status ? ` [${status}]` : ''}: ${message || error.message}`)
    err.status = status
    err.response = data
    err.originalError = error
    throw err
  }
}

module.exports = {
  generatePassword,
  isValidPassword,
  setPayloadToken,
  decodeToken,
  resolveUserId,
  fetchUserInfoByToken
}

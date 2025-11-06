import { describe, it, expect, beforeAll } from '@jest/globals'
import {
  generateToken,
  verifyToken,
  extractBearerToken,
  generateTokenPair,
} from '../../utils/auth'

describe('Auth Utils', () => {
  const mockPayload = {
    user_id: 'user_123',
    email: 'test@example.com',
    auth_identity_id: 'auth_123',
  }

  beforeAll(() => {
    // Définir un JWT_SECRET pour les tests
    process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens'
  })

  describe('generateToken', () => {
    it('devrait générer un access token valide', () => {
      const token = generateToken(mockPayload, 'access')

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT format: header.payload.signature
    })

    it('devrait générer un refresh token valide', () => {
      const token = generateToken(mockPayload, 'refresh')

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
    })
  })

  describe('verifyToken', () => {
    it('devrait vérifier et décoder un token valide', () => {
      const token = generateToken(mockPayload, 'access')
      const decoded = verifyToken(token)

      expect(decoded.user_id).toBe(mockPayload.user_id)
      expect(decoded.email).toBe(mockPayload.email)
      expect(decoded.type).toBe('access')
    })

    it('devrait rejeter un token invalide', () => {
      expect(() => {
        verifyToken('invalid.token.here')
      }).toThrow('Invalid or expired token')
    })

    it('devrait rejeter un token avec une mauvaise signature', () => {
      const token = generateToken(mockPayload, 'access')
      const tamperedToken = token.slice(0, -10) + 'tampered!'

      expect(() => {
        verifyToken(tamperedToken)
      }).toThrow()
    })
  })

  describe('extractBearerToken', () => {
    it('devrait extraire le token d\'un header Bearer valide', () => {
      const token = 'abc123xyz'
      const authHeader = `Bearer ${token}`

      const extracted = extractBearerToken(authHeader)

      expect(extracted).toBe(token)
    })

    it('devrait retourner null si pas de header', () => {
      const extracted = extractBearerToken(undefined)

      expect(extracted).toBeNull()
    })

    it('devrait retourner null si le format est invalide', () => {
      const extracted = extractBearerToken('InvalidFormat token')

      expect(extracted).toBeNull()
    })

    it('devrait retourner null si pas de Bearer', () => {
      const extracted = extractBearerToken('token')

      expect(extracted).toBeNull()
    })
  })

  describe('generateTokenPair', () => {
    it('devrait générer une paire de tokens', () => {
      const pair = generateTokenPair(mockPayload)

      expect(pair).toHaveProperty('access_token')
      expect(pair).toHaveProperty('refresh_token')
      expect(pair).toHaveProperty('expires_in')
      expect(pair.expires_in).toBe(3600) // 1 heure
    })

    it('devrait générer des tokens différents', () => {
      const pair = generateTokenPair(mockPayload)

      expect(pair.access_token).not.toBe(pair.refresh_token)
    })

    it('devrait générer des access et refresh tokens valides', () => {
      const pair = generateTokenPair(mockPayload)

      const accessDecoded = verifyToken(pair.access_token)
      const refreshDecoded = verifyToken(pair.refresh_token)

      expect(accessDecoded.type).toBe('access')
      expect(refreshDecoded.type).toBe('refresh')
      expect(accessDecoded.user_id).toBe(mockPayload.user_id)
      expect(refreshDecoded.user_id).toBe(mockPayload.user_id)
    })
  })
})

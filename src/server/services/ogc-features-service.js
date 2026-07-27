import { fetch } from 'undici'

import { config } from '../../config/config.js'

function getBaseUrl() {
  const baseUrl = config.get('ogcApi.baseUrl')
  if (!baseUrl) {
    throw new Error('OGC_API_BASE_URL is not configured')
  }

  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
}

function createHeaders() {
  const headers = {
    accept: 'application/geo+json, application/json'
  }

  const apiKey = config.get('ogcApi.apiKey')
  const apiSecret = config.get('ogcApi.apiSecret')
  const apiKeyHeader = config.get('ogcApi.apiKeyHeader')
  const apiSecretHeader = config.get('ogcApi.apiSecretHeader')
  const apiKeyQueryParam = config.get('ogcApi.apiKeyQueryParam')
  const apiSecretQueryParam = config.get('ogcApi.apiSecretQueryParam')

  if (apiKey && apiKeyHeader && !apiKeyQueryParam) {
    headers[apiKeyHeader] = apiKey
  }

  if (apiSecret && apiSecretHeader && !apiSecretQueryParam) {
    headers[apiSecretHeader] = apiSecret
  }

  return headers
}

function appendQuery(url, query = {}) {
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') {
      continue
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, item)
      }
      continue
    }

    url.searchParams.append(key, value)
  }

  const apiKey = config.get('ogcApi.apiKey')
  const apiSecret = config.get('ogcApi.apiSecret')
  const apiKeyQueryParam = config.get('ogcApi.apiKeyQueryParam')
  const apiSecretQueryParam = config.get('ogcApi.apiSecretQueryParam')

  if (apiKey && apiKeyQueryParam) {
    url.searchParams.set(apiKeyQueryParam, apiKey)
  }

  if (apiSecret && apiSecretQueryParam) {
    url.searchParams.set(apiSecretQueryParam, apiSecret)
  }
}

async function requestJson(path, query) {
  const url = new URL(path, getBaseUrl())
  appendQuery(url, query)

  const timeoutMs = config.get('ogcApi.timeoutMs')

  const response = await fetch(url, {
    method: 'GET',
    headers: createHeaders(),
    signal: AbortSignal.timeout(timeoutMs)
  })

  if (!response.ok) {
    const body = await response.text()
    const error = new Error(`OGC request failed (${response.status}): ${body}`)
    error.statusCode = response.status
    throw error
  }

  return response.json()
}

async function getCollections(query = {}) {
  return requestJson('collections', query)
}

async function getCollectionItems(collectionId, query = {}) {
  return requestJson(`collections/${encodeURIComponent(collectionId)}/items`, query)
}

export const ogcFeaturesService = {
  getCollections,
  getCollectionItems
}
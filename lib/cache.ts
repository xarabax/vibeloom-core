/**
 * VibeLoom Analysis Cache
 * 
 * Sistema di caching per evitare di ri-analizzare documenti identici.
 * Risparmia token AI e migliora la velocità di risposta.
 * 
 * NOTA: Questa è una implementazione in-memory per development.
 * Per produzione, sostituire con Vercel KV, Redis, o altro storage persistente.
 */

import crypto from "crypto"
import type { AnalysisResult } from "@/lib/ai/types"

// === CONFIGURAZIONE ===

const CACHE_TTL_MS = 24 * 60 * 60 * 1000  // 24 ore
const MAX_CACHE_ENTRIES = 100              // Limite entries per evitare memory leak

// === INTERFACCIA CACHE ===

interface CacheEntry {
    result: AnalysisResult
    timestamp: number
    goalHash: string
    filesHash: string
}

// In-memory cache (sostituire con Vercel KV/Redis in produzione)
const memoryCache = new Map<string, CacheEntry>()

// === FUNZIONI HELPER ===

/**
 * Genera hash SHA-256 di una stringa
 */
function sha256(content: string): string {
    return crypto.createHash("sha256").update(content).digest("hex")
}

/**
 * Genera hash del goal (normalizzato)
 */
function hashGoal(goal: string): string {
    // Normalizza: lowercase, rimuovi spazi extra
    const normalized = goal.toLowerCase().trim().replace(/\s+/g, " ")
    return sha256(normalized)
}

/**
 * Genera hash dei file (basato sul contenuto)
 * Usa solo i primi 10KB di ogni file per performance
 */
function hashFiles(files: { content: string; mimeType: string }[]): string {
    const contentSamples = files
        .map(f => f.content.slice(0, 10000))  // Primi 10KB
        .sort()  // Ordina per consistenza
        .join("|")
    return sha256(contentSamples)
}

/**
 * Genera chiave cache combinando goal e files
 */
function generateCacheKey(goal: string, files: { content: string; mimeType: string }[]): string {
    const goalHash = hashGoal(goal)
    const filesHash = hashFiles(files)
    return `analysis:${goalHash.slice(0, 16)}:${filesHash.slice(0, 16)}`
}

// === API PUBBLICA ===

/**
 * Cerca un risultato nella cache
 * @returns AnalysisResult se trovato e valido, null altrimenti
 */
export async function getCachedAnalysis(
    goal: string, 
    files: { content: string; mimeType: string }[]
): Promise<AnalysisResult | null> {
    const key = generateCacheKey(goal, files)
    const entry = memoryCache.get(key)

    if (!entry) {
        console.log(`[Cache] MISS for key: ${key.slice(0, 30)}...`)
        return null
    }

    // Verifica TTL
    const age = Date.now() - entry.timestamp
    if (age > CACHE_TTL_MS) {
        console.log(`[Cache] EXPIRED for key: ${key.slice(0, 30)}... (age: ${Math.round(age / 1000 / 60)}min)`)
        memoryCache.delete(key)
        return null
    }

    console.log(`[Cache] HIT for key: ${key.slice(0, 30)}... (age: ${Math.round(age / 1000 / 60)}min)`)
    
    // Marca come proveniente da cache
    return {
        ...entry.result,
        // Aggiungi metadata cache (opzionale)
    }
}

/**
 * Salva un risultato nella cache
 */
export async function setCachedAnalysis(
    goal: string,
    files: { content: string; mimeType: string }[],
    result: AnalysisResult
): Promise<void> {
    // Non cacheare risultati mock
    if (result.isMock) {
        console.log("[Cache] Skipping mock result")
        return
    }

    const key = generateCacheKey(goal, files)
    
    // Pulizia cache se troppo grande
    if (memoryCache.size >= MAX_CACHE_ENTRIES) {
        // Rimuovi entry più vecchia
        let oldestKey: string | null = null
        let oldestTime = Infinity
        
        for (const [k, v] of memoryCache.entries()) {
            if (v.timestamp < oldestTime) {
                oldestTime = v.timestamp
                oldestKey = k
            }
        }
        
        if (oldestKey) {
            memoryCache.delete(oldestKey)
            console.log(`[Cache] Evicted oldest entry: ${oldestKey.slice(0, 30)}...`)
        }
    }

    const entry: CacheEntry = {
        result,
        timestamp: Date.now(),
        goalHash: hashGoal(goal),
        filesHash: hashFiles(files),
    }

    memoryCache.set(key, entry)
    console.log(`[Cache] SET for key: ${key.slice(0, 30)}... (total entries: ${memoryCache.size})`)
}

/**
 * Invalida cache per un goal specifico
 */
export async function invalidateCache(goal: string): Promise<number> {
    const goalHash = hashGoal(goal)
    let deleted = 0

    for (const [key, entry] of memoryCache.entries()) {
        if (entry.goalHash === goalHash) {
            memoryCache.delete(key)
            deleted++
        }
    }

    console.log(`[Cache] Invalidated ${deleted} entries for goal hash: ${goalHash.slice(0, 16)}`)
    return deleted
}

/**
 * Pulisce tutta la cache
 */
export async function clearCache(): Promise<void> {
    const size = memoryCache.size
    memoryCache.clear()
    console.log(`[Cache] Cleared all ${size} entries`)
}

/**
 * Statistiche cache (per monitoring)
 */
export function getCacheStats(): {
    entries: number
    maxEntries: number
    ttlHours: number
} {
    return {
        entries: memoryCache.size,
        maxEntries: MAX_CACHE_ENTRIES,
        ttlHours: CACHE_TTL_MS / 1000 / 60 / 60,
    }
}

// === VERSIONE VERCEL KV (per produzione) ===
// Decommentare e configurare quando si passa a produzione

/*
import { kv } from "@vercel/kv"

export async function getCachedAnalysis(
    goal: string, 
    files: { content: string; mimeType: string }[]
): Promise<AnalysisResult | null> {
    const key = generateCacheKey(goal, files)
    return await kv.get<AnalysisResult>(key)
}

export async function setCachedAnalysis(
    goal: string,
    files: { content: string; mimeType: string }[],
    result: AnalysisResult
): Promise<void> {
    if (result.isMock) return
    
    const key = generateCacheKey(goal, files)
    await kv.set(key, result, { ex: CACHE_TTL_MS / 1000 })
}
*/

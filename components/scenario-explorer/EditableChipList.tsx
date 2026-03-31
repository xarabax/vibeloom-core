"use client"

/**
 * EditableChipList - Lista di chips editabili con combobox per aggiunta
 * 
 * Features:
 * - Chips con X per rimuovere (on hover)
 * - Bottone + per aggiungere
 * - Combobox con suggerimenti categorizzati
 * - Supporto per testo libero ("Crea nuovo...")
 */

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Plus,
    X,
    Crosshair,
    Shield,
    TrendingUp,
    Search,
    type LucideIcon
} from "lucide-react"
import type { DecisionTag } from "@/lib/constants/decisionTags"
import { CATEGORY_COLORS } from "@/lib/constants/decisionTags"

// ============================================================================
// PROPS
// ============================================================================

interface EditableChipListProps {
    /** Tipo di lista (per styling) */
    type: "assumptions" | "risks"
    /** Valori correnti */
    values: string[]
    /** Suggerimenti predefiniti */
    suggestions: DecisionTag[]
    /** Callback quando i valori cambiano */
    onChange: (newValues: string[]) => void
    /** Colore base per i chips */
    chipColor?: string
    /** Icona per i chips */
    chipIcon?: LucideIcon
    /** Placeholder per input */
    placeholder?: string
}

// ============================================================================
// CATEGORY ICONS
// ============================================================================

const CategoryIcons: Record<DecisionTag["category"], LucideIcon> = {
    Sniper: Crosshair,
    Guardian: Shield,
    VC: TrendingUp
}

// ============================================================================
// CHIP COMPONENT
// ============================================================================

interface ChipProps {
    label: string
    onRemove: () => void
    color: string
    icon?: LucideIcon
}

function Chip({ label, onRemove, color, icon: Icon }: ChipProps) {
    const [isHovered, setIsHovered] = useState(false)
    
    return (
        <motion.span
            layout
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs
                border transition-all cursor-default group
                ${color}
            `}
        >
            {Icon && <Icon className="w-3 h-3 opacity-70" />}
            <span className="truncate max-w-[150px]">{label}</span>
            
            {/* Remove button - appears on hover */}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onRemove()
                }}
                className={`
                    ml-0.5 p-0.5 rounded-full transition-all
                    hover:bg-white/20
                    ${isHovered ? "opacity-100" : "opacity-0"}
                `}
                aria-label={`Rimuovi ${label}`}
            >
                <X className="w-3 h-3" />
            </button>
        </motion.span>
    )
}

// ============================================================================
// COMBOBOX COMPONENT
// ============================================================================

interface ComboboxProps {
    isOpen: boolean
    onClose: () => void
    suggestions: DecisionTag[]
    existingValues: string[]
    onSelect: (value: string) => void
    placeholder: string
}

function Combobox({ 
    isOpen, 
    onClose, 
    suggestions, 
    existingValues, 
    onSelect,
    placeholder 
}: ComboboxProps) {
    const [search, setSearch] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    
    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])
    
    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                onClose()
            }
        }
        
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
            return () => document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen, onClose])
    
    // Filter suggestions
    const filteredSuggestions = suggestions.filter(s => 
        !existingValues.includes(s.label) &&
        s.label.toLowerCase().includes(search.toLowerCase())
    )
    
    // Group by category
    const grouped = filteredSuggestions.reduce((acc, tag) => {
        if (!acc[tag.category]) acc[tag.category] = []
        acc[tag.category].push(tag)
        return acc
    }, {} as Record<string, DecisionTag[]>)
    
    // Check if search is a new value
    const isNewValue = search.trim() && 
        !suggestions.some(s => s.label.toLowerCase() === search.toLowerCase()) &&
        !existingValues.includes(search.trim())
    
    const handleSelect = (value: string) => {
        onSelect(value)
        setSearch("")
        onClose()
    }
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && isNewValue) {
            handleSelect(search.trim())
        } else if (e.key === "Escape") {
            onClose()
        }
    }
    
    if (!isOpen) return null
    
    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="
                absolute z-50 top-full left-0 mt-2
                w-72 max-h-80 overflow-hidden
                bg-card border border-border rounded-xl shadow-2xl
            "
        >
            {/* Search Input */}
            <div className="p-2 border-b border-border/50">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="
                            w-full pl-8 pr-3 py-2 text-sm
                            bg-muted/50 border border-border/50 rounded-lg
                            text-foreground placeholder:text-muted-foreground
                            focus:outline-none focus:ring-2 focus:ring-accent/50
                        "
                    />
                </div>
            </div>
            
            {/* Suggestions List */}
            <div className="overflow-y-auto max-h-60 p-1">
                {/* Create new option */}
                {isNewValue && (
                    <button
                        onClick={() => handleSelect(search.trim())}
                        className="
                            w-full flex items-center gap-2 px-3 py-2 text-left
                            text-sm text-accent rounded-lg
                            hover:bg-accent/10 transition-colors
                        "
                    >
                        <Plus className="w-4 h-4" />
                        Crea "{search.trim()}"
                    </button>
                )}
                
                {/* Grouped suggestions */}
                {Object.entries(grouped).map(([category, tags]) => {
                    const CategoryIcon = CategoryIcons[category as DecisionTag["category"]]
                    const categoryColor = CATEGORY_COLORS[category as DecisionTag["category"]]
                    
                    return (
                        <div key={category} className="mb-2">
                            {/* Category Header */}
                            <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground uppercase tracking-wider">
                                <CategoryIcon className="w-3 h-3" />
                                {category}
                            </div>
                            
                            {/* Tags */}
                            {tags.map((tag) => (
                                <button
                                    key={tag.label}
                                    onClick={() => handleSelect(tag.label)}
                                    title={tag.tooltip}
                                    className={`
                                        w-full flex items-center justify-between gap-2 px-3 py-2
                                        text-sm text-left rounded-lg
                                        hover:bg-muted/50 transition-colors
                                        group
                                    `}
                                >
                                    <span className="text-foreground">{tag.label}</span>
                                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-[120px]">
                                        {tag.tooltip}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )
                })}
                
                {/* Empty state */}
                {filteredSuggestions.length === 0 && !isNewValue && (
                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                        Nessun suggerimento trovato
                    </div>
                )}
            </div>
        </motion.div>
    )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EditableChipList({
    type,
    values,
    suggestions,
    onChange,
    chipColor = "bg-muted text-muted-foreground border-border",
    chipIcon,
    placeholder = "Cerca o crea..."
}: EditableChipListProps) {
    const [isComboboxOpen, setIsComboboxOpen] = useState(false)
    
    const handleRemove = (value: string) => {
        onChange(values.filter(v => v !== value))
    }
    
    const handleAdd = (value: string) => {
        if (!values.includes(value)) {
            onChange([...values, value])
        }
    }
    
    return (
        <div className="relative">
            <div className="flex flex-wrap gap-1.5 items-center">
                <AnimatePresence mode="popLayout">
                    {values.map((value) => (
                        <Chip
                            key={value}
                            label={value}
                            onRemove={() => handleRemove(value)}
                            color={chipColor}
                            icon={chipIcon}
                        />
                    ))}
                </AnimatePresence>
                
                {/* Add Button */}
                <button
                    onClick={() => setIsComboboxOpen(true)}
                    className="
                        inline-flex items-center justify-center
                        w-6 h-6 rounded-full
                        bg-muted/30 border border-dashed border-muted-foreground/30
                        text-muted-foreground
                        hover:bg-muted/50 hover:border-muted-foreground/50
                        transition-all
                    "
                    aria-label={`Aggiungi ${type === "assumptions" ? "assunzione" : "rischio"}`}
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>
            
            {/* Combobox Dropdown */}
            <AnimatePresence>
                {isComboboxOpen && (
                    <Combobox
                        isOpen={isComboboxOpen}
                        onClose={() => setIsComboboxOpen(false)}
                        suggestions={suggestions}
                        existingValues={values}
                        onSelect={handleAdd}
                        placeholder={placeholder}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

import { z } from 'zod'

export const outfitSuggestionSchema = z.object({
  name: z.string(),
  items: z.array(z.string()),
  styling_tip: z.string(),
  accessories_needed: z.array(z.string()),
})

export const suggestOutfitResponseSchema = z.object({
  outfits: z.array(outfitSuggestionSchema).max(3),
})

export type SuggestOutfitResponse = z.infer<typeof suggestOutfitResponseSchema>
export type OutfitSuggestion = z.infer<typeof outfitSuggestionSchema>

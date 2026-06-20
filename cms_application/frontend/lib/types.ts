export type Service = { id: number; title: string; slug: string; short_description: string; full_description: string; image?: string; category?: string };
export type Project = { id: number; title: string; slug: string; category: string; description: string; image?: string; status: string; location?: string; is_featured?: boolean };
export type CartItem = { service: number; service_title_snapshot: string; note: string; quantity: number };

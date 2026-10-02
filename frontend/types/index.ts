export type User = { id: number; email: string; full_name: string; role: "client" | "admin"; phone?: string | null; company?: string | null; country?: string | null };
export type Service = { id: number; slug: string; title: string; icon: string; description: string; features: string[]; starting_price: number; delivery_estimate: string; image_url: string; is_active: boolean; sort_order: number };
export type CaseStudy = { overview?: string; problem?: string; solution?: string; architecture?: string; process?: string; challenges?: string; results?: string; deployment?: string };
export type Project = { id: number; slug: string; title: string; category: string; summary: string; image_url: string; technologies: string[]; features: string[]; gallery: string[]; case_study: CaseStudy; live_url?: string | null; github_url?: string | null; is_featured: boolean; is_published: boolean; sort_order: number };
export type Testimonial = { id: number; name: string; company: string; role: string; avatar_url: string; quote: string; is_demo: boolean; is_published: boolean };
export type FileRec = { id: number; filename: string; content_type: string; size: number; uploaded_by_role: string; created_at: string };
export type Msg = { id: number; sender_role: "client" | "admin"; body: string; is_read: boolean; created_at: string; attachments: FileRec[] };
export type Upd = { id: number; title: string; body: string; progress: number | null; created_at: string };
export type Note = { id: number; body: string; created_at: string };
export type Order = {
  id: number; order_number: string; client_name: string; client_email: string; client_phone?: string | null; company?: string | null; country?: string | null;
  service_title: string; project_title: string; project_type?: string | null; budget?: string | null; deadline?: string | null; requirements: string;
  details: Record<string, unknown>; status: string; priority: string; quoted_amount?: number | null; created_at: string; updated_at: string;
  progress: number; stage: string; files?: FileRec[]; updates?: Upd[]; notes?: Note[];
};
export const STATUSES = ["New", "Contacted", "Discussion", "Quote Sent", "Payment Pending", "In Progress", "Review", "Completed", "Cancelled"] as const;
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
export const STAGES = ["Request Received", "Discussion", "Planning", "Development", "Testing", "Review", "Completed"] as const;

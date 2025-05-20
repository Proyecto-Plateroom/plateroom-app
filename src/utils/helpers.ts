import type { SupabaseClient } from "@supabase/supabase-js";

export function createFileName(organization_id: string, file: File): string {
    const fileExt = file?.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${organization_id}/dishes/${fileName}`;

    return filePath;
}

export function getFileUrl(supabase: SupabaseClient, filePath: string): string {
    const { data } = supabase
        .storage
        .from('plateroom-images')
        .getPublicUrl(filePath);

    return data.publicUrl;
}

export function randomString(len: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    return Array.from(crypto.getRandomValues(new Uint8Array(len)))
        .map((n) => chars[n % chars.length])
        .join('');
};

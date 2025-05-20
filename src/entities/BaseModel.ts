import { SupabaseClient } from "@supabase/supabase-js"

export abstract class BaseModel<T> {
  protected supabase: SupabaseClient
  protected abstract tableName: string

  constructor(init?: Partial<T>, supabaseClient?: SupabaseClient) {
    Object.assign(this, init)

    if (!supabaseClient) {
      throw new Error("SupabaseClient is not initialized")
    }
    this.supabase = supabaseClient;
  }

  query() {
    return this.supabase.from(this.tableName)
  }

  rawQuery(table: string) {
    return this.supabase.from(table)
  }

  toJSON(): string {
    return JSON.stringify(this)
  }

  async uploadFile(filePath: string, file: File | Blob) {
    return await this.supabase
      .storage
      .from("plateroom-images")
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
  }

  getPublicUrl(bucket: string, filePath: string): string {
    const { data } = this.supabase
      .storage
      .from(bucket)
      .getPublicUrl(filePath)

    return data.publicUrl
  }

}

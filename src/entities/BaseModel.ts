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

  toJSON(): string {
    return JSON.stringify(this)
  }

}

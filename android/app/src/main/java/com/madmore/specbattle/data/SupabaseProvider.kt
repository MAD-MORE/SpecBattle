package com.madmore.specbattle.data

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.functions.Functions
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.realtime.Realtime

object SupabaseProvider {
    // Replace these at build time; never use a secret/service-role key in the APK.
    private const val URL = "https://YOUR_PROJECT.supabase.co"
    private const val PUBLISHABLE_KEY = "YOUR_SB_PUBLISHABLE_KEY"

    val client = createSupabaseClient(URL, PUBLISHABLE_KEY) {
        install(Auth)
        install(Postgrest)
        install(Realtime)
        install(Functions)
    }
}

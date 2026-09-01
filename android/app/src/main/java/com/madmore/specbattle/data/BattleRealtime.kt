package com.madmore.specbattle.data

import io.github.jan.supabase.realtime.RealtimeChannel
import kotlinx.coroutines.flow.Flow
import kotlinx.serialization.Serializable

@Serializable
data class BattleEvent(
    val type: String,
    val battleId: String,
    val side: String? = null,
    val category: String? = null,
    val winner: String? = null,
    val scoreA: Double? = null,
    val scoreB: Double? = null,
    val sequence: Long
)

class BattleRealtime(private val channel: RealtimeChannel) {
    fun events(): Flow<BattleEvent> = channel.broadcastFlow(event = "battle_event")

    suspend fun join() = channel.join(blockUntilJoined = true)

    suspend fun publish(event: BattleEvent) {
        channel.broadcast(event = "battle_event", message = event)
    }

    suspend fun close() {
        channel.leave()
    }
}

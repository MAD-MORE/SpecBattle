package com.madmore.specbattle.domain

import kotlin.math.pow

object LeagueEngine {
    data class RatingChange(val beforeA: Double, val beforeB: Double, val afterA: Double, val afterB: Double)

    fun expected(ratingA: Double, ratingB: Double): Double =
        1.0 / (1.0 + 10.0.pow((ratingB - ratingA) / 400.0))

    fun update(
        ratingA: Double,
        ratingB: Double,
        winner: Winner,
        kFactor: Double = 32.0
    ): RatingChange {
        val scoreA = when (winner) { Winner.A -> 1.0; Winner.B -> 0.0; else -> 0.5 }
        val scoreB = 1.0 - scoreA
        val expectedA = expected(ratingA, ratingB)
        val expectedB = 1.0 - expectedA
        return RatingChange(
            ratingA,
            ratingB,
            ratingA + kFactor * (scoreA - expectedA),
            ratingB + kFactor * (scoreB - expectedB)
        )
    }
}

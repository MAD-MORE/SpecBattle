package com.madmore.specbattle.domain

import kotlin.math.abs

object BattleEngine {
    private const val EPSILON = 1e-9

    fun battle(phoneA: Phone, phoneB: Phone): BattleResult {
        val aByKey = phoneA.specs.associateBy { it.key }
        val bByKey = phoneB.specs.associateBy { it.key }
        val comparable = mutableListOf<SpecComparison>()

        val keys = (aByKey.keys + bByKey.keys).sorted()
        for (key in keys) {
            val a = aByKey[key]
            val b = bByKey[key]
            if (a?.value == null || b?.value == null) {
                comparable += SpecComparison(key, a?.category ?: b?.category ?: "Other", null, null, Winner.UNKNOWN)
                continue
            }
            val min = minOf(a.value, b.value)
            val max = maxOf(a.value, b.value)
            val direction = a.higherIsBetter && b.higherIsBetter
            val scoreA: Double
            val scoreB: Double
            if (abs(max - min) < EPSILON) {
                scoreA = 0.5
                scoreB = 0.5
            } else if (direction) {
                scoreA = (a.value - min) / (max - min)
                scoreB = (b.value - min) / (max - min)
            } else {
                scoreA = (max - a.value) / (max - min)
                scoreB = (max - b.value) / (max - min)
            }
            val winner = when {
                scoreA > scoreB + EPSILON -> Winner.A
                scoreB > scoreA + EPSILON -> Winner.B
                else -> Winner.DRAW
            }
            comparable += SpecComparison(key, a.category.ifBlank { b.category }, scoreA, scoreB, winner)
        }

        val valid = comparable.filter { it.scoreA != null && it.scoreB != null }
        val categories = valid.groupBy { it.category }.map { (category, items) ->
            val weights = items.map { key ->
                val a = aByKey[key.key]?.weight ?: 1.0
                val b = bByKey[key.key]?.weight ?: 1.0
                (a + b) / 2.0
            }
            val totalWeight = weights.sum().coerceAtLeast(EPSILON)
            val scoreA = items.mapIndexed { i, c -> c.scoreA!! * weights[i] }.sum() / totalWeight
            val scoreB = items.mapIndexed { i, c -> c.scoreB!! * weights[i] }.sum() / totalWeight
            CategoryResult(category, scoreA, scoreB, when {
                scoreA > scoreB + EPSILON -> Winner.A
                scoreB > scoreA + EPSILON -> Winner.B
                else -> Winner.DRAW
            })
        }.sortedBy { it.category }

        val categoryA = categories.map { it.scoreA }.averageOrZero()
        val categoryB = categories.map { it.scoreB }.averageOrZero()
        val totalKnown = keys.count { aByKey[it]?.value != null && bByKey[it]?.value != null }
        val confidence = if (keys.isEmpty()) 0.0 else totalKnown.toDouble() / keys.size

        return BattleResult(
            phoneA = phoneA,
            phoneB = phoneB,
            comparisons = comparable,
            categories = categories,
            overallA = categoryA,
            overallB = categoryB,
            winner = when {
                categoryA > categoryB + EPSILON -> Winner.A
                categoryB > categoryA + EPSILON -> Winner.B
                else -> Winner.DRAW
            },
            comparableCount = totalKnown,
            confidence = confidence
        )
    }

    private fun List<Double>.averageOrZero(): Double = if (isEmpty()) 0.0 else average()
}

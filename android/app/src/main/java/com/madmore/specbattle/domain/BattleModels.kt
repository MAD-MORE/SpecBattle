package com.madmore.specbattle.domain

import kotlinx.serialization.Serializable

@Serializable
data class PhoneSpec(
    val key: String,
    val category: String,
    val value: Double? = null,
    val unit: String? = null,
    val higherIsBetter: Boolean = true,
    val weight: Double = 1.0
)

data class Phone(
    val id: String,
    val brand: String,
    val model: String,
    val specs: List<PhoneSpec>
)

data class SpecComparison(
    val key: String,
    val category: String,
    val scoreA: Double?,
    val scoreB: Double?,
    val winner: Winner
)

enum class Winner { A, B, DRAW, UNKNOWN }

data class CategoryResult(
    val category: String,
    val scoreA: Double,
    val scoreB: Double,
    val winner: Winner
)

data class BattleResult(
    val phoneA: Phone,
    val phoneB: Phone,
    val comparisons: List<SpecComparison>,
    val categories: List<CategoryResult>,
    val overallA: Double,
    val overallB: Double,
    val winner: Winner,
    val comparableCount: Int,
    val confidence: Double
)

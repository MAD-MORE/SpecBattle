package com.madmore.specbattle.domain

import kotlinx.serialization.Serializable

@Serializable
data class PhoneSpec(
    val key: String = "",
    val category: String = "",
    val value: Double? = null,
    val unit: String? = null,
    val higherIsBetter: Boolean = true,
    val weight: Double = 1.0,
    // Compatibility fields for the UI's legacy demo-phone constructor.
    val cpu: Double? = null,
    val gpu: Double? = null,
    val camera: Double? = null,
    val battery: Double? = null,
    val display: Double? = null,
    val ram: Double? = null
)

data class Phone(
    val id: String,
    val brand: String,
    val model: String,
    val specs: List<PhoneSpec>
) {
    // Backward-compatible constructor used by the current demo UI.
    constructor(model: String, specs: PhoneSpec) : this(
        id = "demo-${model.lowercase().replace(Regex("[^a-z0-9]+"), "-").trim('-')}",
        brand = model.substringBefore(' ', model),
        model = model,
        specs = specs.toAtomicSpecs()
    )
}

private fun PhoneSpec.toAtomicSpecs(): List<PhoneSpec> = listOfNotNull(
    cpu?.let { PhoneSpec(key = "cpu", category = "CPU", value = it) },
    gpu?.let { PhoneSpec(key = "gpu", category = "GPU", value = it) },
    camera?.let { PhoneSpec(key = "camera", category = "Camera", value = it) },
    battery?.let { PhoneSpec(key = "battery", category = "Battery", value = it) },
    display?.let { PhoneSpec(key = "display", category = "Display", value = it) },
    ram?.let { PhoneSpec(key = "ram", category = "RAM", value = it, unit = "GB") },
    value?.let { PhoneSpec(key = "value", category = "Value", value = it) }
).ifEmpty {
    if (key.isNotBlank()) listOf(this) else emptyList()
}

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

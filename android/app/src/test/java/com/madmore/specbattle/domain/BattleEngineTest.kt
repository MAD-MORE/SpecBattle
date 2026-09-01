package com.madmore.specbattle.domain

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class BattleEngineTest {
    @Test
    fun higherAndLowerDirectionsAreHandled() {
        val a = Phone("a", "Test", "A", listOf(
            PhoneSpec("speed", "Performance", 10.0, "x", true),
            PhoneSpec("weight", "Physical", 180.0, "g", false),
        ))
        val b = Phone("b", "Test", "B", listOf(
            PhoneSpec("speed", "Performance", 8.0, "x", true),
            PhoneSpec("weight", "Physical", 200.0, "g", false),
        ))

        val result = BattleEngine.battle(a, b)

        assertEquals(Winner.A, result.winner)
        assertEquals(2, result.comparableCount)
        assertTrue(result.overallA > result.overallB)
        assertEquals(1.0, result.confidence, 0.000001)
    }

    @Test
    fun equalValuesProduceDraw() {
        val specs = listOf(PhoneSpec("ram", "Memory", 8.0, "GB", true))
        val result = BattleEngine.battle(
            Phone("a", "T", "A", specs),
            Phone("b", "T", "B", specs),
        )
        assertEquals(Winner.DRAW, result.winner)
    }

    @Test
    fun missingDataDoesNotAwardOpponent() {
        val a = Phone("a", "T", "A", listOf(PhoneSpec("ram", "Memory", null, "GB", true)))
        val b = Phone("b", "T", "B", listOf(PhoneSpec("ram", "Memory", 8.0, "GB", true)))
        val result = BattleEngine.battle(a, b)
        assertEquals(Winner.UNKNOWN, result.comparisons.single().winner)
        assertEquals(0, result.comparableCount)
        assertEquals(0.0, result.confidence, 0.000001)
    }
}

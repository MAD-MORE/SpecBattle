package com.madmore.specbattle

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AccountCircle
import androidx.compose.material.icons.rounded.Bolt
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.EmojiEvents
import androidx.compose.material.icons.rounded.NotificationsNone
import androidx.compose.material.icons.rounded.Smartphone
import androidx.compose.material.icons.rounded.SportsMma
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.madmore.specbattle.domain.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private val Blue = Color(0xFF367CFF)
private val Violet = Color(0xFF7656FF)
private val Cyan = Color(0xFF20BFD0)
private val Green = Color(0xFF17B879)
private val Orange = Color(0xFFFF9F43)
private val Ink = Color(0xFF172033)
private val Muted = Color(0xFF687386)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { SpecBattleApp() }
    }
}

@Composable
private fun SpecBattleApp() {
    MaterialTheme(colorScheme = lightColorScheme(primary = Blue, background = Color(0xFFF8FAFF), surface = Color.White)) {
        AnimatedBackdrop { HomeScreen() }
    }
}

@Composable
private fun AnimatedBackdrop(content: @Composable () -> Unit) {
    val transition = rememberInfiniteTransition(label = "light-backdrop")
    val phase by transition.animateFloat(0f, 1f, infiniteRepeatable(tween(7000, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "phase")
    Box(Modifier.fillMaxSize().background(Brush.linearGradient(listOf(Color(0xFFF9FCFF), Color(0xFFF3F0FF), Color(0xFFEFFFFF), Color.White), startX = phase * 500f, endX = 900f + phase * 300f))) { content() }
}

@Composable
private fun HomeScreen() {
    val a = remember { demoPhoneA() }
    val b = remember { demoPhoneB() }
    val result = remember { BattleEngine.battle(a, b) }
    var started by remember { mutableStateOf(false) }
    var revealed by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(17.dp)) {
        item { Header() }
        item { AccountCard() }
        item { SectionTitle("Choose your battle", "Compare real device specifications") }
        item { BattleCard(a, b, result, started, revealed) {
            scope.launch { started = true; revealed = false; delay(1100); revealed = true }
        } }
        item { SectionTitle("Category stats", "Calculated from the battle engine") }
        items(result.categories) { CategoryStat(it.category, it.winner, result) }
        item { SectionTitle("Your activity", "Battle history and progress") }
        item { ActivityCard() }
        item { Spacer(Modifier.height(16.dp)) }
    }
}

@Composable private fun Header() {
    Row(Modifier.fillMaxWidth().padding(top = 7.dp), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text("SPEC BATTLE", color = Ink, fontSize = 27.sp, fontWeight = FontWeight.Black)
            Text("Compare. Battle. Decide.", color = Muted, fontSize = 13.sp)
        }
        IconButton(onClick = {}) { Icon(Icons.Rounded.NotificationsNone, "Notifications", tint = Ink) }
        IconButton(onClick = {}) { Icon(Icons.Rounded.AccountCircle, "Profile", tint = Blue, modifier = Modifier.size(31.dp)) }
    }
}

@Composable private fun AccountCard() {
    Card(Modifier.fillMaxWidth(), RoundedCornerShape(25.dp), colors = CardDefaults.cardColors(Color.White.copy(.94f)), elevation = CardDefaults.cardElevation(5.dp)) {
        Row(Modifier.padding(18.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(55.dp).clip(CircleShape).background(Brush.linearGradient(listOf(Blue, Violet))), contentAlignment = Alignment.Center) { Text("G", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold) }
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1f)) {
                Text("Guest Player", color = Ink, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Text("Proving Ground", color = Violet, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            }
            Icon(Icons.Rounded.EmojiEvents, "Rank", tint = Orange, modifier = Modifier.size(27.dp))
        }
        Row(Modifier.fillMaxWidth().padding(start = 18.dp, end = 18.dp, bottom = 18.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Metric("24", "Battles"); Metric("17", "Wins"); Metric("71%", "Win rate")
        }
    }
}

@Composable private fun Metric(value: String, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) { Text(value, color = Ink, fontSize = 19.sp, fontWeight = FontWeight.ExtraBold); Text(label, color = Muted, fontSize = 11.sp) }
}

@Composable private fun SectionTitle(title: String, subtitle: String) {
    Column(Modifier.fillMaxWidth()) { Text(title, color = Ink, fontSize = 21.sp, fontWeight = FontWeight.ExtraBold); Text(subtitle, color = Muted, fontSize = 12.sp) }
}

@Composable private fun BattleCard(a: Phone, b: Phone, r: BattleResult, started: Boolean, revealed: Boolean, onStart: () -> Unit) {
    Card(Modifier.fillMaxWidth(), RoundedCornerShape(29.dp), colors = CardDefaults.cardColors(Color.White.copy(.97f)), elevation = CardDefaults.cardElevation(7.dp)) {
        Column(Modifier.padding(19.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text("SMARTPHONE SHOWDOWN", color = Blue, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.5.sp)
            Spacer(Modifier.height(13.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly, verticalAlignment = Alignment.CenterVertically) {
                PhoneCard(a.model, r.overallA, r.winner == Winner.A, started, -1)
                Box(Modifier.size(47.dp).clip(RoundedCornerShape(15.dp)).background(Brush.linearGradient(listOf(Violet, Blue))), contentAlignment = Alignment.Center) { Text("VS", color = Color.White, fontWeight = FontWeight.Black, fontSize = 13.sp) }
                PhoneCard(b.model, r.overallB, r.winner == Winner.B, started, 1)
            }
            Spacer(Modifier.height(17.dp))
            AnimatedContent(targetState = revealed, label = "result") { show ->
                if (show) Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Rounded.CheckCircle, null, tint = Green, modifier = Modifier.size(20.dp)); Spacer(Modifier.width(6.dp)); Text("Winner: ${if (r.winner == Winner.A) a.model else b.model}", color = Green, fontWeight = FontWeight.Bold)
                } else Text("Ready for battle?", color = Muted, fontSize = 13.sp)
            }
            Spacer(Modifier.height(13.dp))
            Button(onClick = onStart, enabled = !started || revealed, Modifier.fillMaxWidth().height(53.dp), RoundedCornerShape(17.dp), colors = ButtonDefaults.buttonColors(containerColor = Blue)) {
                Icon(Icons.Rounded.SportsMma, null); Spacer(Modifier.width(8.dp)); Text(if (started && !revealed) "BATTLE IN PROGRESS…" else if (revealed) "BATTLE AGAIN" else "START BATTLE", fontWeight = FontWeight.ExtraBold)
            }
        }
    }
}

@Composable private fun PhoneCard(name: String, score: Double, winner: Boolean, started: Boolean, direction: Int) {
    val x by animateFloatAsState(if (started) 0f else direction * 12f, tween(700, easing = FastOutSlowInEasing), label = "phone")
    Column(horizontalAlignment = Alignment.CenterHorizontally, Modifier.graphicsLayer { translationX = x }) {
        Box(Modifier.size(width = 74.dp, height = 132.dp).clip(RoundedCornerShape(22.dp)).background(Brush.verticalGradient(listOf(if (direction < 0) Blue else Cyan, Violet))), contentAlignment = Alignment.Center) {
            Box(Modifier.size(width = 64.dp, height = 122.dp).clip(RoundedCornerShape(18.dp)).background(Color(0xFF172033)), contentAlignment = Alignment.Center) { Icon(Icons.Rounded.Smartphone, null, tint = Color.White.copy(.88f), modifier = Modifier.size(38.dp)) }
        }
        Spacer(Modifier.height(7.dp)); Text(name, color = Ink, fontWeight = FontWeight.Bold, fontSize = 13.sp); Text("${"%.1f".format(score * 100)}", color = if (winner) Green else Ink, fontWeight = FontWeight.ExtraBold, fontSize = 21.sp)
    }
}

@Composable private fun CategoryStat(category: String, winner: String, result: BattleResult) {
    val categoryResult = result.categories.firstOrNull { it.category == category }
    val winnerLabel = if (categoryResult?.winner == Winner.A) "Phone A wins" else if (categoryResult?.winner == Winner.B) "Phone B wins" else winner
    Card(Modifier.fillMaxWidth(), RoundedCornerShape(21.dp), colors = CardDefaults.cardColors(Color.White.copy(.94f)), elevation = CardDefaults.cardElevation(2.dp)) {
        Column(Modifier.padding(16.dp)) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(38.dp).clip(RoundedCornerShape(12.dp)).background(Color(0xFFEAF1FF)), contentAlignment = Alignment.Center) { Icon(if (category.contains("Performance", true)) Icons.Rounded.Bolt else Icons.Rounded.Smartphone, null, tint = Blue) }
                Spacer(Modifier.width(10.dp)); Text(category, color = Ink, fontWeight = FontWeight.Bold, Modifier.weight(1f)); Text(winnerLabel, color = Green, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.height(10.dp))
            LinearProgressIndicator(progress = { 1f }, Modifier.fillMaxWidth().height(7.dp).clip(RoundedCornerShape(8.dp)), color = Blue, trackColor = Color(0xFFE9EEF7))
        }
    }
}

@Composable private fun ActivityCard() {
    Card(Modifier.fillMaxWidth(), RoundedCornerShape(22.dp), colors = CardDefaults.cardColors(Color.White.copy(.94f)), elevation = CardDefaults.cardElevation(3.dp)) {
        Column(Modifier.padding(18.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceAround) { Metric("12", "Battles"); Metric("8", "Wins"); Metric("67%", "Win rate") }
            Spacer(Modifier.height(16.dp)); Text("Recent battles", color = Ink, fontWeight = FontWeight.Bold); Spacer(Modifier.height(8.dp)); Text("Galaxy S25  •  Victory  •  92–87", color = Muted, fontSize = 12.sp); Text("Pixel 10 Pro  •  Defeat  •  89–91", color = Muted, fontSize = 12.sp)
        }
    }
}

private fun demoPhoneA() = Phone("demo-a", "Spec Battle", "Phone A", listOf(PhoneSpec("cpu", "Performance", 3.2, "GHz", true, 2.0), PhoneSpec("gpu", "Performance", 920.0, "score", true, 2.0), PhoneSpec("ram", "Memory", 12.0, "GB", true, 1.0), PhoneSpec("storage", "Storage", 256.0, "GB", true, 1.0), PhoneSpec("refresh_rate", "Display", 120.0, "Hz", true, 1.0), PhoneSpec("battery", "Battery", 5000.0, "mAh", true, 1.0), PhoneSpec("weight", "Physical", 185.0, "g", false, .5)))
private fun demoPhoneB() = Phone("demo-b", "Spec Battle", "Phone B", listOf(PhoneSpec("cpu", "Performance", 3.0, "GHz", true, 2.0), PhoneSpec("gpu", "Performance", 880.0, "score", true, 2.0), PhoneSpec("ram", "Memory", 8.0, "GB", true, 1.0), PhoneSpec("storage", "Storage", 512.0, "GB", true, 1.0), PhoneSpec("refresh_rate", "Display", 144.0, "Hz", true, 1.0), PhoneSpec("battery", "Battery", 4800.0, "mAh", true, 1.0), PhoneSpec("weight", "Physical", 172.0, "g", false, .5)))

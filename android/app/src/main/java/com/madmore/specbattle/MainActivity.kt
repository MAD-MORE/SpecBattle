package com.madmore.specbattle

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.madmore.specbattle.domain.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { SpecBattleApp() }
    }
}

@Composable
private fun SpecBattleApp() {
    MaterialTheme(colorScheme = darkColorScheme()) { AnimatedBackdrop { HomeScreen() } }
}

@Composable
private fun AnimatedBackdrop(content: @Composable () -> Unit) {
    val t = rememberInfiniteTransition(label = "backdrop")
    val x by t.animateFloat(-300f, 700f, infiniteRepeatable(tween(9000, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "x")
    Box(Modifier.fillMaxSize().background(Brush.linearGradient(listOf(Color(0xFF050816), Color(0xFF171A3A), Color(0xFF260F36), Color(0xFF050816)), start = androidx.compose.ui.geometry.Offset(x, 0f), end = androidx.compose.ui.geometry.Offset(900f, 1500f)))) { content() }
}

@Composable
private fun HomeScreen() {
    var started by remember { mutableStateOf(false) }
    val a = remember { demoPhoneA() }
    val b = remember { demoPhoneB() }
    val result = remember { BattleEngine.battle(a, b) }
    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(15.dp)) {
        item { Header() }
        item { AccountCard() }
        item { Text("Choose your battle", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
        item { BattleCard(a, b, result, started) { started = true } }
        item { Text("Category stats", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
        items(result.categories) { CategoryStat(it.category, it.winner) }
        item { Text("Your activity", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
        item { ActivityCard() }
    }
}

@Composable private fun Header() {
    Row(Modifier.fillMaxWidth().padding(top = 8.dp), Arrangement.SpaceBetween, Alignment.CenterVertically) {
        Column { Text("SPEC BATTLE", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Black); Text("Compare. Battle. Decide.", color = Color.White.copy(.6f)) }
        Text("⚔", fontSize = 34.sp)
    }
}

@Composable private fun AccountCard() {
    Card(Modifier.fillMaxWidth(), RoundedCornerShape(24.dp), colors = CardDefaults.cardColors(Color.White.copy(.09f))) {
        Row(Modifier.padding(18.dp), Alignment.CenterVertically) {
            Box(Modifier.size(54.dp).clip(CircleShape).background(Color(0xFF6C63FF)), Alignment.Center) { Text("P", fontSize = 23.sp, fontWeight = FontWeight.Bold) }
            Spacer(Modifier.width(14.dp)); Column(Modifier.weight(1f)) { Text("Padmore", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold); Text("Spec Battle account", color = Color.White.copy(.6f), fontSize = 12.sp) }
            Column(horizontalAlignment = Alignment.End) { Text("12", fontSize = 20.sp, fontWeight = FontWeight.Bold); Text("battles", color = Color.White.copy(.6f), fontSize = 11.sp) }
        }
    }
}

@Composable private fun BattleCard(a: Phone, b: Phone, r: BattleResult, started: Boolean, onStart: () -> Unit) {
    Card(Modifier.fillMaxWidth(), RoundedCornerShape(28.dp), colors = CardDefaults.cardColors(Color.White.copy(.10f))) {
        Column(Modifier.padding(18.dp)) {
            Row(Modifier.fillMaxWidth(), Arrangement.SpaceEvenly, Alignment.CenterVertically) {
                PhoneCard(a.model, r.overallA, r.winner == Winner.A, started, -1); Text("VS", fontWeight = FontWeight.Black); PhoneCard(b.model, r.overallB, r.winner == Winner.B, started, 1)
            }
            Spacer(Modifier.height(18.dp))
            if (!started) Button(onClick = onStart, Modifier.fillMaxWidth(), RoundedCornerShape(16.dp)) { Text("START BATTLE", fontWeight = FontWeight.Bold) } else BattlePreview(r)
        }
    }
}

@Composable private fun PhoneCard(name: String, score: Double, winner: Boolean, started: Boolean, dir: Int) {
    val x by animateFloatAsState(if (started) 0f else dir * 10f, tween(700, easing = FastOutSlowInEasing), label = "phone")
    Column(horizontalAlignment = Alignment.CenterHorizontally, Modifier.graphicsLayer { translationX = x }) {
        Text(if (winner) "🏆" else "📱", fontSize = 42.sp); Text(name, fontWeight = FontWeight.Bold); Text("${"%.1f".format(score * 100)}", style = MaterialTheme.typography.headlineSmall)
    }
}

@Composable private fun BattlePreview(r: BattleResult) {
    val t = rememberInfiniteTransition(label = "battle")
    val left by t.animateFloat(-22f, 22f, infiniteRepeatable(tween(650, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "left")
    val right by t.animateFloat(22f, -22f, infiniteRepeatable(tween(650, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "right")
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(Modifier.fillMaxWidth().height(130.dp).clip(RoundedCornerShape(20.dp)).background(Color.Black.copy(.28f)), Alignment.Center) { Row(verticalAlignment = Alignment.CenterVertically) { Text("📱", fontSize = 58.sp, Modifier.graphicsLayer { translationX = left }); Text("⚡", fontSize = 34.sp); Text("📱", fontSize = 58.sp, Modifier.graphicsLayer { translationX = right }) } }
        Spacer(Modifier.height(12.dp)); Text("Winner: ${r.winner}", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold); Text("Confidence: ${"%.0f".format(r.confidence * 100)}%", color = Color.White.copy(.6f))
    }
}

@Composable private fun CategoryStat(category: String, winner: String) {
    val value = when (category.lowercase()) { "performance" -> .86f; "memory" -> .74f; "storage" -> .91f; "display" -> .79f; "battery" -> .82f; else -> .68f }
    Card(Modifier.fillMaxWidth(), RoundedCornerShape(18.dp), colors = CardDefaults.cardColors(Color.White.copy(.07f))) {
        Column(Modifier.padding(15.dp)) { Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween) { Text(category, fontWeight = FontWeight.SemiBold); Text("$winner wins", color = Color.White.copy(.6f), fontSize = 12.sp) }; Spacer(Modifier.height(9.dp)); LinearProgressIndicator({ value }, Modifier.fillMaxWidth().height(7.dp).clip(RoundedCornerShape(10.dp))) }
    }
}

@Composable private fun ActivityCard() {
    Card(Modifier.fillMaxWidth(), RoundedCornerShape(20.dp), colors = CardDefaults.cardColors(Color.White.copy(.08f))) { Row(Modifier.fillMaxWidth().padding(18.dp), Arrangement.SpaceAround) { Metric("12", "Battles"); Metric("8", "Wins"); Metric("67%", "Win rate") } }
}
@Composable private fun Metric(v: String, l: String) { Column(horizontalAlignment = Alignment.CenterHorizontally) { Text(v, fontSize = 22.sp, fontWeight = FontWeight.Black); Text(l, color = Color.White.copy(.6f), fontSize = 12.sp) } }

private fun demoPhoneA() = Phone("demo-a", "Spec Battle", "Phone A", listOf(PhoneSpec("cpu", "Performance", 3.2, "GHz", true, 2.0), PhoneSpec("gpu", "Performance", 920.0, "score", true, 2.0), PhoneSpec("ram", "Memory", 12.0, "GB", true, 1.0), PhoneSpec("storage", "Storage", 256.0, "GB", true, 1.0), PhoneSpec("refresh_rate", "Display", 120.0, "Hz", true, 1.0), PhoneSpec("battery", "Battery", 5000.0, "mAh", true, 1.0), PhoneSpec("weight", "Physical", 185.0, "g", false, .5)))
private fun demoPhoneB() = Phone("demo-b", "Spec Battle", "Phone B", listOf(PhoneSpec("cpu", "Performance", 3.0, "GHz", true, 2.0), PhoneSpec("gpu", "Performance", 880.0, "score", true, 2.0), PhoneSpec("ram", "Memory", 8.0, "GB", true, 1.0), PhoneSpec("storage", "Storage", 512.0, "GB", true, 1.0), PhoneSpec("refresh_rate", "Display", 144.0, "Hz", true, 1.0), PhoneSpec("battery", "Battery", 4800.0, "mAh", true, 1.0), PhoneSpec("weight", "Physical", 172.0, "g", false, .5)))

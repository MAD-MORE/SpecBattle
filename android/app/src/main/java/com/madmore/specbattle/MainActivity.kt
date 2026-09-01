package com.madmore.specbattle

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.madmore.specbattle.domain.BattleEngine
import com.madmore.specbattle.domain.Phone
import com.madmore.specbattle.domain.PhoneSpec
import com.madmore.specbattle.domain.Winner

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { SpecBattleApp() }
    }
}

@androidx.compose.runtime.Composable
private fun SpecBattleApp() {
    MaterialTheme(colorScheme = darkColorScheme()) {
        Surface(modifier = Modifier.fillMaxSize()) { HomeScreen() }
    }
}

@androidx.compose.runtime.Composable
private fun HomeScreen() {
    var battle by remember { mutableStateOf(false) }
    val phoneA = demoPhoneA()
    val phoneB = demoPhoneB()
    val result = remember { BattleEngine.battle(phoneA, phoneB) }

    Column(
        modifier = Modifier.fillMaxSize().padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("⚔️ SPEC BATTLE", style = MaterialTheme.typography.headlineLarge)
        Text("Stop arguing. Let the phones battle.", fontSize = 15.sp)
        Spacer(Modifier.height(28.dp))
        Card(modifier = Modifier.fillMaxWidth()) {
            Column(Modifier.padding(18.dp)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    PhoneCard(phoneA.model, result.overallA, result.winner == Winner.A)
                    Text("VS", modifier = Modifier.align(Alignment.CenterVertically))
                    PhoneCard(phoneB.model, result.overallB, result.winner == Winner.B)
                }
                Spacer(Modifier.height(18.dp))
                if (battle) BattlePreview(result) else {
                    Button(onClick = { battle = true }, modifier = Modifier.fillMaxWidth()) {
                        Text("START BATTLE")
                    }
                }
            }
        }
    }
}

@androidx.compose.runtime.Composable
private fun PhoneCard(name: String, score: Double, winner: Boolean) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(if (winner) "🏆" else "📱", fontSize = 36.sp)
        Text(name, style = MaterialTheme.typography.titleMedium)
        Text("${"%.1f".format(score * 100)}", style = MaterialTheme.typography.headlineMedium)
    }
}

@androidx.compose.runtime.Composable
private fun BattlePreview(result: com.madmore.specbattle.domain.BattleResult) {
    val transition = rememberInfiniteTransition(label = "battle")
    val leftX by transition.animateFloat(
        initialValue = -12f,
        targetValue = 12f,
        animationSpec = infiniteRepeatable(tween(350), RepeatMode.Reverse),
        label = "left-phone"
    )
    val rightX by transition.animateFloat(
        initialValue = 12f,
        targetValue = -12f,
        animationSpec = infiniteRepeatable(tween(350), RepeatMode.Reverse),
        label = "right-phone"
    )

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier.fillMaxWidth().height(120.dp).background(Color(0xFF090B12)),
            contentAlignment = Alignment.Center
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("📱", fontSize = 52.sp, modifier = Modifier.graphicsLayer { translationX = leftX })
                Text("⚔️", fontSize = 34.sp)
                Text("📱", fontSize = 52.sp, modifier = Modifier.graphicsLayer { translationX = rightX })
            }
        }
        Spacer(Modifier.height(14.dp))
        result.categories.forEach { category -> Text("${category.category}: ${category.winner}") }
        Spacer(Modifier.height(10.dp))
        Text("Winner: ${result.winner}", style = MaterialTheme.typography.headlineSmall)
        Text("Confidence: ${"%.0f".format(result.confidence * 100)}%")
    }
}

private fun demoPhoneA() = Phone(
    id = "demo-a", brand = "Spec Battle", model = "Phone A",
    specs = listOf(
        PhoneSpec("cpu", "Performance", 3.2, "GHz", true, 2.0),
        PhoneSpec("gpu", "Performance", 920.0, "score", true, 2.0),
        PhoneSpec("ram", "Memory", 12.0, "GB", true, 1.0),
        PhoneSpec("storage", "Storage", 256.0, "GB", true, 1.0),
        PhoneSpec("refresh_rate", "Display", 120.0, "Hz", true, 1.0),
        PhoneSpec("battery", "Battery", 5000.0, "mAh", true, 1.0),
        PhoneSpec("weight", "Physical", 185.0, "g", false, 0.5)
    )
)

private fun demoPhoneB() = Phone(
    id = "demo-b", brand = "Spec Battle", model = "Phone B",
    specs = listOf(
        PhoneSpec("cpu", "Performance", 3.0, "GHz", true, 2.0),
        PhoneSpec("gpu", "Performance", 880.0, "score", true, 2.0),
        PhoneSpec("ram", "Memory", 8.0, "GB", true, 1.0),
        PhoneSpec("storage", "Storage", 512.0, "GB", true, 1.0),
        PhoneSpec("refresh_rate", "Display", 144.0, "Hz", true, 1.0),
        PhoneSpec("battery", "Battery", 4800.0, "mAh", true, 1.0),
        PhoneSpec("weight", "Physical", 172.0, "g", false, 0.5)
    )
)

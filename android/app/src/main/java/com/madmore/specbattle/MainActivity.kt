package com.madmore.specbattle

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
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
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.madmore.specbattle.domain.BattleEngine
import com.madmore.specbattle.domain.BattleResult
import com.madmore.specbattle.domain.Phone
import com.madmore.specbattle.domain.PhoneSpec
import com.madmore.specbattle.domain.Winner
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
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = Blue,
            background = Color(0xFFF8FAFF),
            surface = Color.White
        )
    ) {
        AnimatedBackdrop { HomeScreen() }
    }
}

@Composable
private fun AnimatedBackdrop(content: @Composable () -> Unit) {
    val transition = rememberInfiniteTransition(label = "light-backdrop")
    val phase by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(7000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "phase"
    )
    val start = Offset(phase * 500f, 0f)
    val end = Offset(900f + phase * 300f, 900f)
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.linearGradient(
                    colors = listOf(
                        Color(0xFFF9FCFF),
                        Color(0xFFF3F0FF),
                        Color(0xFFEFFFFF),
                        Color.White
                    ),
                    start = start,
                    end = end
                )
            )
    ) {
        content()
    }
}

@Composable
private fun HomeScreen() {
    val a = remember { demoPhoneA() }
    val b = remember { demoPhoneB() }
    val result = remember { BattleEngine.battle(a, b) }
    var started by remember { mutableStateOf(false) }
    var revealed by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(17.dp)
    ) {
        item { Header() }
        item { AccountCard() }
        item {
            SectionTitle(
                title = "Choose your battle",
                subtitle = "Compare real device specifications"
            )
        }
        item {
            BattleCard(
                a = a,
                b = b,
                r = result,
                started = started,
                revealed = revealed,
                onStart = {
                    scope.launch {
                        started = true
                        revealed = false
                        delay(1100)
                        revealed = true
                    }
                }
            )
        }
        item {
            SectionTitle(
                title = "Category stats",
                subtitle = "Calculated from the battle engine"
            )
        }
        items(result.categories) { category ->
            CategoryStat(
                category = category.category,
                winner = category.winner,
                result = result
            )
        }
        item {
            SectionTitle(
                title = "Your activity",
                subtitle = "Battle history and progress"
            )
        }
        item { ActivityCard() }
        item { Spacer(modifier = Modifier.height(16.dp)) }
    }
}

@Composable
private fun Header() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 7.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = "SPEC BATTLE",
                color = Ink,
                fontSize = 27.sp,
                fontWeight = FontWeight.Black
            )
            Text(
                text = "Compare. Battle. Decide.",
                color = Muted,
                fontSize = 13.sp
            )
        }
        IconButton(onClick = {}) {
            Icon(
                imageVector = Icons.Rounded.NotificationsNone,
                contentDescription = "Notifications",
                tint = Ink
            )
        }
        IconButton(onClick = {}) {
            Icon(
                imageVector = Icons.Rounded.AccountCircle,
                contentDescription = "Profile",
                tint = Blue,
                modifier = Modifier.size(31.dp)
            )
        }
    }
}

@Composable
private fun AccountCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(25.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White.copy(alpha = 0.94f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 5.dp)
    ) {
        Row(
            modifier = Modifier.padding(18.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(55.dp)
                    .clip(CircleShape)
                    .background(Brush.linearGradient(listOf(Blue, Violet))),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "G",
                    color = Color.White,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Guest Player",
                    color = Ink,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Proving Ground",
                    color = Violet,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
            Icon(
                imageVector = Icons.Rounded.EmojiEvents,
                contentDescription = "Rank",
                tint = Orange,
                modifier = Modifier.size(27.dp)
            )
        }
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = 18.dp, end = 18.dp, bottom = 18.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Metric(value = "24", label = "Battles")
            Metric(value = "17", label = "Wins")
            Metric(value = "71%", label = "Win rate")
        }
    }
}

@Composable
private fun Metric(value: String, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            color = Ink,
            fontSize = 19.sp,
            fontWeight = FontWeight.ExtraBold
        )
        Text(text = label, color = Muted, fontSize = 11.sp)
    }
}

@Composable
private fun SectionTitle(title: String, subtitle: String) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = title,
            color = Ink,
            fontSize = 21.sp,
            fontWeight = FontWeight.ExtraBold
        )
        Text(text = subtitle, color = Muted, fontSize = 12.sp)
    }
}

@Composable
private fun BattleCard(
    a: Phone,
    b: Phone,
    r: BattleResult,
    started: Boolean,
    revealed: Boolean,
    onStart: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(29.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White.copy(alpha = 0.97f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 7.dp)
    ) {
        Column(
            modifier = Modifier.padding(19.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "SMARTPHONE SHOWDOWN",
                color = Blue,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.5.sp
            )
            Spacer(modifier = Modifier.height(13.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                PhoneCard(
                    name = a.model,
                    score = r.overallA,
                    winner = r.winner == Winner.A,
                    started = started,
                    direction = -1
                )
                Box(
                    modifier = Modifier
                        .size(47.dp)
                        .clip(RoundedCornerShape(15.dp))
                        .background(Brush.linearGradient(listOf(Violet, Blue))),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "VS",
                        color = Color.White,
                        fontWeight = FontWeight.Black,
                        fontSize = 13.sp
                    )
                }
                PhoneCard(
                    name = b.model,
                    score = r.overallB,
                    winner = r.winner == Winner.B,
                    started = started,
                    direction = 1
                )
            }
            Spacer(modifier = Modifier.height(17.dp))
            AnimatedContent(
                targetState = revealed,
                label = "result"
            ) { show ->
                if (show) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Rounded.CheckCircle,
                            contentDescription = null,
                            tint = Green,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Winner: ${winnerName(r, a, b)}",
                            color = Green,
                            fontWeight = FontWeight.Bold
                        )
                    }
                } else {
                    Text(
                        text = "Ready for battle?",
                        color = Muted,
                        fontSize = 13.sp
                    )
                }
            }
            Spacer(modifier = Modifier.height(13.dp))
            Button(
                onClick = onStart,
                enabled = !started || revealed,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(53.dp),
                shape = RoundedCornerShape(17.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Blue)
            ) {
                Icon(
                    imageVector = Icons.Rounded.SportsMma,
                    contentDescription = null
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = when {
                        started && !revealed -> "BATTLE IN PROGRESS…"
                        revealed -> "BATTLE AGAIN"
                        else -> "START BATTLE"
                    },
                    fontWeight = FontWeight.ExtraBold
                )
            }
        }
    }
}

private fun winnerName(result: BattleResult, a: Phone, b: Phone): String = when (result.winner) {
    Winner.A -> a.model
    Winner.B -> b.model
    Winner.DRAW -> "Draw"
    Winner.UNKNOWN -> "Undecided"
}

@Composable
private fun PhoneCard(
    name: String,
    score: Double,
    winner: Boolean,
    started: Boolean,
    direction: Int
) {
    val x by animateFloatAsState(
        targetValue = if (started) 0f else direction * 12f,
        animationSpec = tween(700, easing = FastOutSlowInEasing),
        label = "phone"
    )
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.graphicsLayer { translationX = x }
    ) {
        Box(
            modifier = Modifier
                .size(width = 74.dp, height = 132.dp)
                .clip(RoundedCornerShape(22.dp))
                .background(
                    Brush.verticalGradient(
                        listOf(
                            if (direction < 0) Blue else Cyan,
                            Violet
                        )
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .size(width = 64.dp, height = 122.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(Ink),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Rounded.Smartphone,
                    contentDescription = null,
                    tint = Color.White.copy(alpha = 0.88f),
                    modifier = Modifier.size(38.dp)
                )
            }
        }
        Spacer(modifier = Modifier.height(7.dp))
        Text(
            text = name,
            color = Ink,
            fontWeight = FontWeight.Bold,
            fontSize = 13.sp
        )
        Text(
            text = "${"%.1f".format(score * 100)}",
            color = if (winner) Green else Ink,
            fontWeight = FontWeight.ExtraBold,
            fontSize = 21.sp
        )
    }
}

@Composable
private fun CategoryStat(
    category: String,
    winner: Winner,
    result: BattleResult
) {
    val categoryResult = result.categories.firstOrNull { it.category == category }
    val winnerLabel = when (categoryResult?.winner ?: winner) {
        Winner.A -> "Phone A wins"
        Winner.B -> "Phone B wins"
        Winner.DRAW -> "Draw"
        Winner.UNKNOWN -> "No clear winner"
    }
    val progress = categoryResult?.let { maxOf(it.scoreA, it.scoreB).coerceIn(0.0, 1.0).toFloat() } ?: 0f

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(21.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White.copy(alpha = 0.94f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFFEAF1FF)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Bolt,
                        contentDescription = null,
                        tint = Blue
                    )
                }
                Spacer(modifier = Modifier.width(11.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = category,
                        color = Ink,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                    Text(
                        text = winnerLabel,
                        color = Muted,
                        fontSize = 11.sp
                    )
                }
            }
            Spacer(modifier = Modifier.height(11.dp))
            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(7.dp)
                    .clip(RoundedCornerShape(50)),
                color = Blue,
                trackColor = Color(0xFFE8ECF4)
            )
        }
    }
}

@Composable
private fun ActivityCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(23.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.94f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(17.dp)) {
            ActivityRow("Latest battle", "Galaxy S25 Ultra vs iPhone 16 Pro", "WIN")
            Spacer(modifier = Modifier.height(12.dp))
            ActivityRow("Longest streak", "7 victories", "7×")
            Spacer(modifier = Modifier.height(12.dp))
            ActivityRow("Next milestone", "25 total battles", "96%")
        }
    }
}

@Composable
private fun ActivityRow(title: String, value: String, badge: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(title, color = Muted, fontSize = 11.sp)
            Text(value, color = Ink, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
        }
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(10.dp))
                .background(Color(0xFFEAFBF5))
                .padding(horizontal = 9.dp, vertical = 6.dp)
        ) {
            Text(badge, color = Green, fontWeight = FontWeight.Bold, fontSize = 11.sp)
        }
    }
}

private fun demoPhoneA(): Phone = Phone(
    model = "Galaxy S25 Ultra",
    specs = PhoneSpec(
        cpu = 9.6,
        gpu = 9.3,
        camera = 9.4,
        battery = 9.2,
        display = 9.6,
        value = 8.4
    )
)

private fun demoPhoneB(): Phone = Phone(
    model = "iPhone 16 Pro",
    specs = PhoneSpec(
        cpu = 9.4,
        gpu = 9.5,
        camera = 9.5,
        battery = 8.7,
        display = 9.2,
        value = 8.2
    )
)

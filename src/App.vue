<script setup>
import { ref, computed } from 'vue'
import {
  IonApp,
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton
} from '@ionic/vue'

// One-file Ionic Vue app: Caesar + Vigenere, encrypt + decrypt.
const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const letters = [...AZ]
const algorithm = ref('vigenere')
const action = ref('encrypt')
const inputText = ref('THANKYOU')
const keyword = ref('COVER')
const caesarAmount = ref(3)
const extraAmount = ref(0)
const selectedIndex = ref(0)
const copyState = ref('')

function clamp(value) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.max(0, Math.min(25, Math.trunc(n))) : 0
}

function mod26(value) {
  return ((value % 26) + 26) % 26
}

function isAsciiLetter(character) {
  return /^[A-Za-z]$/.test(character)
}

function rotate(character, positions) {
  if (!isAsciiLetter(character)) return character
  const code = character.charCodeAt(0)
  const base = code >= 97 && code <= 122 ? 97 : 65
  return String.fromCharCode(base + mod26(code - base + positions))
}

function caesarCipher(text, amount, decrypt) {
  const step = clamp(amount) * (decrypt ? -1 : 1)
  return [...text].map(character => rotate(character, step)).join('')
}

function vigenereCipher(text, key, extraShift, decrypt) {
  if (!key) return ''
  let position = 0
  let output = ''
  for (const character of text) {
    if (!isAsciiLetter(character)) {
      output += character
      continue
    }
    const keyShift = key.charCodeAt(position % key.length) - 65
    const shift = mod26(keyShift + clamp(extraShift))
    output += rotate(character, decrypt ? -shift : shift)
    position++
  }
  return output
}

const key = computed(() => keyword.value.toUpperCase().replace(/[^A-Z]/g, ''))
const decrypting = computed(() => action.value === 'decrypt')
const shift = computed({
  get: () => algorithm.value === 'caesar' ? caesarAmount.value : extraAmount.value,
  set: value => {
    if (algorithm.value === 'caesar') caesarAmount.value = clamp(value)
    else extraAmount.value = clamp(value)
  }
})

const output = computed(() => {
  if (!inputText.value) return ''
  if (algorithm.value === 'caesar') {
    return caesarCipher(inputText.value, caesarAmount.value, decrypting.value)
  }
  return vigenereCipher(inputText.value, key.value, extraAmount.value, decrypting.value)
})

const letterCount = computed(() => [...inputText.value].filter(isAsciiLetter).length)
const outputAlphabet = computed(() => {
  const offset = clamp(caesarAmount.value) * (decrypting.value ? -1 : 1)
  return letters.map(character => rotate(character, offset))
})

// The table is the standard Tabula Recta: row=key shift, column=plaintext.
const tabulaRecta = letters.map((_, row) =>
  letters.map((__, col) => AZ[(row + col) % 26])
)

// Display the first 32 alphabetic characters to keep the table responsive.
const steps = computed(() => {
  if (!key.value || algorithm.value !== 'vigenere') return []
  const data = []
  let position = 0
  for (const character of inputText.value) {
    if (!isAsciiLetter(character)) continue
    const originalKey = key.value[position % key.value.length]
    const row = mod26(originalKey.charCodeAt(0) - 65 + clamp(extraAmount.value))
    const inputLetter = character.toUpperCase()
    const plain = decrypting.value ? rotate(inputLetter, -row) : inputLetter
    const encrypted = decrypting.value ? inputLetter : rotate(inputLetter, row)
    if (data.length < 32) {
      data.push({
        index: position,
        originalKey,
        effectiveKey: AZ[row],
        row,
        col: plain.charCodeAt(0) - 65,
        plain,
        encrypted,
        input: inputLetter
      })
    }
    position++
  }
  return data
})

const selectedStep = computed(() => steps.value[Math.min(selectedIndex.value, steps.value.length - 1)] || null)

function chooseAlgorithm(value) {
  algorithm.value = value
  selectedIndex.value = 0
  copyState.value = ''
}

function chooseAction(value) {
  action.value = value
  selectedIndex.value = 0
  copyState.value = ''
}

function example() {
  action.value = 'encrypt'
  if (algorithm.value === 'caesar') {
    inputText.value = 'HELLO WORLD'
    caesarAmount.value = 3
  } else {
    inputText.value = 'THANKYOU'
    keyword.value = 'COVER'
    extraAmount.value = 0
  }
  selectedIndex.value = 0
}

function clearText() {
  inputText.value = ''
  selectedIndex.value = 0
  copyState.value = ''
}

function reverse() {
  if (!output.value) return
  inputText.value = output.value
  action.value = decrypting.value ? 'encrypt' : 'decrypt'
  selectedIndex.value = 0
  copyState.value = ''
}

async function copyOutput() {
  if (!output.value) return
  try {
    await navigator.clipboard.writeText(output.value)
    copyState.value = 'Copied!'
  } catch {
    copyState.value = 'Copy unavailable — select the result text.'
  }
}
</script>

<template>
  <IonApp>
    <IonPage>
      <IonHeader class="ion-no-border">
        <IonToolbar class="top-toolbar">
          <div class="toolbar-inner">
            <div class="brand">
              <span class="brand-mark">&gt;_</span>
              <div>
                <strong class="brand-name">LIGHT<span>CIPHER</span></strong>
                <small>NEON CIPHER INTERFACE</small>
              </div>
            </div>
            <span class="status"><i></i> LOCAL SESSION</span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <main class="shell">
          <div class="page">
            <section class="hero neon-frame">
              <div class="hero-copy">
                <div class="eyebrow"><span class="tiny-cross">✳</span> ACCESS GRANTED <span class="eyebrow-line"></span>
                  CRYPTO TERMINAL / 001</div>
                <div class="hero-version">[ SYSTEM ONLINE // CLASSICAL CIPHERS ]</div>
                <h1 class="glitch-heading">Enter the<br><em>cipherverse<span class="hero-period">.</span></em></h1>
                <p>Crack the pattern, not the screen. Explore Caesar and Vigenère with a neon hacker aesthetic, soft
                  contrast, and a live interactive cipher table.</p>
                <div class="tags"><span>01 / CAESAR</span><span>02 / VIGENÈRE</span><span>ENCRYPT ↔ DECRYPT</span></div>
                <div class="hero-system"><span class="system-dot"></span> STATIC GLITCH FX <span
                    class="hero-pipe">/</span> COMFORT VIEWING ENABLED</div>
              </div>
              <div class="hero-visual">
                <div class="hacker-top"><span
                    class="window-dots"><i></i><i></i><i></i></span><span>USER://CIPHER_OPERATIVE</span><span>⊞</span>
                </div>
                <svg viewBox="0 0 620 390" class="hacker-art" role="img"
                  aria-label="Original geometric illustration of a hooded cyber analyst working at a laptop inside a digital grid">
                  <defs>
                    <linearGradient id="hoodGradient" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0" stop-color="#56518a" />
                      <stop offset="1" stop-color="#262643" />
                    </linearGradient>
                    <linearGradient id="laptopGradient" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0" stop-color="#41406c" />
                      <stop offset="1" stop-color="#24253c" />
                    </linearGradient>
                    <linearGradient id="jacketGradient" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0" stop-color="#39385e" />
                      <stop offset="1" stop-color="#25243f" />
                    </linearGradient>
                  </defs>
                  <!-- Calm digital background, not animated -->
                  <g stroke="#585185" opacity=".23" stroke-width="1">
                    <path d="M0 40H620M0 90H620M0 140H620M0 190H620M0 240H620M0 290H620M0 340H620" />
                    <path
                      d="M40 0V390M100 0V390M160 0V390M220 0V390M280 0V390M340 0V390M400 0V390M460 0V390M520 0V390M580 0V390" />
                  </g>
                  <g fill="#9a7cc9" opacity=".34">
                    <circle cx="50" cy="50" r="3" />
                    <circle cx="200" cy="90" r="3" />
                    <circle cx="460" cy="40" r="3" />
                    <circle cx="575" cy="190" r="3" />
                    <circle cx="80" cy="295" r="3" />
                    <circle cx="525" cy="310" r="3" />
                  </g>
                  <!-- Angular neon picture frame -->
                  <path d="M45 70V26H205L237 58" fill="none" stroke="#78cfdc" stroke-width="3" />
                  <path d="M570 70V26H415" fill="none" stroke="#e981bd" stroke-width="3" />
                  <path d="M46 268V342H182" fill="none" stroke="#e981bd" stroke-width="3" />
                  <path d="M574 277V343H445" fill="none" stroke="#78cfdc" stroke-width="3" />
                  <path d="M237 58H316M340 26H385M45 190V235M574 117V185" fill="none" stroke="#8c82c8"
                    stroke-width="5" />
                  <!-- Decorative code lines -->
                  <g fill="#7973b9" opacity=".65">
                    <rect x="66" y="103" width="92" height="6" />
                    <rect x="66" y="117" width="58" height="6" />
                    <rect x="66" y="132" width="78" height="6" />
                    <rect x="78" y="160" width="47" height="6" />
                    <rect x="78" y="175" width="71" height="6" />
                    <rect x="78" y="189" width="38" height="6" />
                  </g>
                  <g fill="#77c8e1" opacity=".78">
                    <rect x="479" y="111" width="72" height="6" />
                    <rect x="484" y="125" width="58" height="6" />
                    <rect x="471" y="139" width="86" height="6" />
                    <rect x="493" y="153" width="63" height="6" />
                    <rect x="484" y="180" width="68" height="6" />
                    <rect x="493" y="194" width="48" height="6" />
                    <rect x="475" y="208" width="78" height="6" />
                  </g>
                  <!-- Halo -->
                  <circle cx="312" cy="170" r="130" fill="none" stroke="#719af2" stroke-width="1.5" opacity=".65" />
                  <circle cx="312" cy="170" r="118" fill="none" stroke="#8476c3" stroke-width="1" opacity=".45"
                    stroke-dasharray="6 13" />
                  <path d="M312 38V50M312 287V302M175 170H190M434 170H449" stroke="#e981bd" stroke-width="2" />
                  <!-- Hood, feminine long sweep, silhouette -->
                  <path
                    d="M188 310C192 259 212 233 242 220L250 160C251 100 276 74 309 70C362 63 393 100 398 165L400 222C440 240 459 269 462 318L475 357H176Z"
                    fill="url(#jacketGradient)" stroke="#6b72bc" stroke-width="2" />
                  <path d="M254 102C278 67 344 62 375 111L404 193L368 219L348 169L287 170L253 225L222 197Z"
                    fill="url(#hoodGradient)" stroke="#7b89d1" stroke-width="2" />
                  <path
                    d="M271 115C283 94 335 85 358 110C371 127 379 157 368 182C352 202 328 212 312 212C286 211 265 193 256 176C255 148 259 132 271 115Z"
                    fill="#14162d" />
                  <path d="M265 178C250 231 233 265 243 308L263 325L274 218Z" fill="#4a4a80" opacity=".8" />
                  <path d="M372 174C381 231 406 260 397 322L377 325L362 215Z" fill="#7285d5" opacity=".65" />
                  <path d="M279 107C290 93 305 88 318 85C283 91 259 119 253 155" fill="none" stroke="#e981bd"
                    stroke-width="3" opacity=".7" />
                  <!-- Low-key eyes; no strobes -->
                  <path d="M280 174L301 178L293 182Z" fill="#80c9f5" />
                  <path d="M324 178L345 174L332 182Z" fill="#80c9f5" />
                  <!-- Cape edges -->
                  <path d="M228 240C199 250 187 275 180 312M399 240C437 257 444 283 458 318" fill="none"
                    stroke="#e981bd" stroke-width="3" opacity=".4" />
                  <!-- Laptop front -->
                  <path d="M195 251H431L411 348H217Z" fill="url(#laptopGradient)" stroke="#6776d6" stroke-width="2" />
                  <path d="M215 348H421L438 356H204Z" fill="#242540" stroke="#6572ba" stroke-width="1.5" />
                  <path d="M205 266H421" stroke="#e981bd" stroke-width="2" opacity=".75" />
                  <!-- Original shield / cipher symbol -->
                  <path d="M314 280L335 287V305C332 318 323 326 314 330C304 324 295 318 293 305V287Z" fill="#6f75c6"
                    opacity=".75" />
                  <path d="M314 286V322M303 299L314 310L326 296" fill="none" stroke="#93e6de" stroke-width="2.5" />
                  <!-- Faint polygon effects -->
                  <g fill="#e981bd" opacity=".35">
                    <rect x="553" y="62" width="7" height="7" />
                    <rect x="549" y="76" width="12" height="3" />
                    <rect x="108" y="322" width="12" height="4" />
                  </g>
                  <g stroke="#76cddb" stroke-width="3">
                    <path d="M105 40H124M500 344H520" />
                  </g>
                </svg>
                <div class="art-terminal"><span class="terminal-caret">&gt;_</span>
                  <div><small>{{ decrypting ? 'DECRYPTED' : 'ENCRYPTED' }} OUTPUT</small><strong>{{ output || 'AWAITING INPUT_' }}</strong></div><span class="art-signal">● LOCAL</span>
                </div>
              </div>
            </section>

            <div class="workspace">
              <section class="panel">
                <div class="section-head">
                  <div><span class="kicker">01 / PARAMETERS</span>
                    <h2>Cipher configuration</h2>
                    <p>Choose an algorithm and enter your text.</p>
                  </div><span class="bracket">[ CFG ]</span>
                </div>

                <div class="field">
                  <label>Algorithm</label>
                  <div class="choice-row">
                    <button type="button" :class="['choice', { active: algorithm === 'caesar' }]"
                      :aria-pressed="algorithm === 'caesar'" @click="chooseAlgorithm('caesar')">
                      <b>C</b><span><strong>Caesar</strong><small>Fixed rotation</small></span>
                    </button>
                    <button type="button" :class="['choice', { active: algorithm === 'vigenere' }]"
                      :aria-pressed="algorithm === 'vigenere'" @click="chooseAlgorithm('vigenere')">
                      <b>V</b><span><strong>Vigenère</strong><small>Keyword rotation</small></span>
                    </button>
                  </div>
                </div>

                <div class="field">
                  <label>Operation</label>
                  <div class="segmented">
                    <button type="button" :class="{ active: action === 'encrypt' }" :aria-pressed="action === 'encrypt'"
                      @click="chooseAction('encrypt')">↗ Encrypt</button>
                    <button type="button" :class="{ active: action === 'decrypt' }" :aria-pressed="action === 'decrypt'"
                      @click="chooseAction('decrypt')">↙ Decrypt</button>
                  </div>
                </div>

                <div v-if="algorithm === 'vigenere'" class="field">
                  <label for="secret-key">Secret keyword</label>
                  <input id="secret-key" v-model="keyword" class="control" type="text" placeholder="Example: COVER"
                    spellcheck="false" autocomplete="off" />
                  <small v-if="!key" class="warning">Enter a keyword containing A–Z letters.</small>
                  <small v-else class="help">Active key: <b>{{ key }}</b></small>
                </div>

                <div class="field">
                  <label for="shift-number">{{ algorithm === 'caesar' ? 'Caesar shift' : 'Additional keyword shift'
                    }}</label>
                  <div class="slider-card">
                    <div class="slider-top"><span>Alphabet positions · 0–25</span>
                      <div><input id="shift-number" v-model.number="shift" type="number" min="0" max="25"
                          @blur="shift = clamp(shift)" /><small>/25</small></div>
                    </div>
                    <input v-model.number="shift" class="range" type="range" min="0" max="25"
                      aria-label="Cipher shift" />
                    <div class="range-limits"><span>0 / no added shift</span><span>25 / maximum</span></div>
                  </div>
                  <small v-if="algorithm === 'vigenere'" class="help">Set this to 0 for standard Vigenère
                    encryption.</small>
                </div>

                <div class="field">
                  <div class="input-top"><label for="message">Input message</label>
                    <div><button type="button" @click="example">Example</button><button type="button"
                        @click="clearText">Clear</button></div>
                  </div>
                  <textarea id="message" v-model="inputText" class="editor" spellcheck="false"
                    placeholder="Type your message here..."></textarea>
                  <div class="under-editor">{{ inputText.length }} characters · {{ letterCount }} letters</div>
                </div>
              </section>

              <section class="panel results-panel">
                <div class="section-head">
                  <div><span class="kicker">02 / PROCESSOR</span>
                    <h2>Cipher output</h2>
                    <p>Output updates instantly while you type.</p>
                  </div><span class="bracket">[ OUT ]</span>
                </div>
                <div class="result-status"><span><i></i>{{ output ? 'OUTPUT GENERATED' : 'AWAITING INPUT'
                    }}</span><span>{{ algorithm.toUpperCase() }}</span></div>
                <label class="field-label" for="result-box">{{ decrypting ? 'Decrypted plaintext' : 'Encrypted ciphertext' }}</label>
                <textarea id="result-box" class="editor output-editor" :value="output"
                  placeholder="Result appears here..." readonly spellcheck="false"></textarea>
                <div class="under-editor">{{ output.length }} characters · {{ decrypting ? 'DECRYPT' : 'ENCRYPT' }} mode
                </div>
                <div class="action-row">
                  <IonButton class="button-copy" :disabled="!output" @click="copyOutput">Copy result</IonButton>
                  <IonButton class="button-reverse" :disabled="!output" @click="reverse">⇄ Reverse</IonButton>
                </div>
                <p v-if="copyState" class="feedback" role="status">{{ copyState }}</p>
                <div class="notes"><strong>// HOW IT WORKS</strong>
                  <p v-if="algorithm === 'caesar'">Each letter rotates by {{ caesarAmount }} position(s). Decryption
                    rotates in the opposite direction. Spaces, numbers, and punctuation remain unchanged.</p>
                  <p v-else>The keyword repeats across alphabetic characters. The extra shift adds to each keyword
                    letter’s shift. The square below highlights the actual effective key row used.</p>
                </div>

                <div v-if="algorithm === 'caesar'" class="caesar-preview">
                  <div class="preview-label">ALPHABET MAP · {{ decrypting ? 'DECRYPT' : 'ENCRYPT' }}</div>
                  <div class="alphabet-scroll">
                    <div class="letter-grid">
                      <div v-for="(ch, index) in letters" :key="ch" class="letter-tile"><span>{{ ch
                          }}</span><b>↓</b><strong>{{ outputAlphabet[index] }}</strong></div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <section v-if="algorithm === 'vigenere'" class="panel matrix-panel">
              <div class="section-head">
                <div><span class="kicker">03 / INTERACTIVE VISUALIZER</span>
                  <h2>Vigenère square · 26 × 26</h2>
                  <p>Select a letter step to trace the plaintext column and effective keyword row.</p>
                </div><span class="bracket">[ A–Z ]</span>
              </div>
              <div v-if="steps.length">
                <div class="preview-label">SELECT LETTER (FIRST {{ steps.length }}{{ letterCount > 32 ? ' OF ' +
                  letterCount : '' }})</div>
                <div class="steps">
                  <button v-for="step in steps" :key="step.index" type="button"
                    :class="['step', { active: selectedStep && step.index === selectedStep.index }]"
                    :aria-pressed="selectedStep && step.index === selectedStep.index"
                    @click="selectedIndex = step.index">
                    <small>{{ step.index + 1 }}</small><strong>{{ step.input }}</strong><span>{{ step.originalKey
                      }}</span>
                  </button>
                </div>

                <div v-if="selectedStep" class="step-details">
                  <div><small>PLAINTEXT</small><strong>{{ selectedStep.plain }}</strong></div>
                  <div><small>KEY</small><strong>{{ selectedStep.originalKey }}</strong></div>
                  <div><small>EFFECTIVE ROW</small><strong>{{ selectedStep.effectiveKey }}</strong></div>
                  <div><small>CIPHERTEXT</small><strong>{{ selectedStep.encrypted }}</strong></div>
                </div>

                <div class="matrix-scroll" tabindex="0" aria-label="Scrollable Vigenere cipher table">
                  <table class="matrix">
                    <thead>
                      <tr>
                        <th scope="col" class="corner">KEY ↓ / TEXT →</th>
                        <th v-for="(ch, col) in letters" :key="'h' + col" scope="col"
                          :class="{ 'col-focus': selectedStep && col === selectedStep.col }">{{ ch }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(rowLabel, row) in letters" :key="'r' + row">
                        <th scope="row" :class="{ 'row-focus': selectedStep && row === selectedStep.row }">{{ rowLabel
                          }}</th>
                        <td v-for="(ch, col) in tabulaRecta[row]" :key="row + '-' + col" :class="{
                          'row-line': selectedStep && row === selectedStep.row,
                          'col-line': selectedStep && col === selectedStep.col,
                          'intersection': selectedStep && row === selectedStep.row && col === selectedStep.col
                        }">{{ ch }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p v-if="selectedStep" class="matrix-explain">
                  <strong>Step {{ selectedStep.index + 1 }}:</strong>
                  Key <b>{{ selectedStep.originalKey }}</b> with extra shift <b>{{ extraAmount }}</b> selects effective
                  row <b>{{ selectedStep.effectiveKey }}</b>.
                  Plaintext column <b>{{ selectedStep.plain }}</b> intersects it at ciphertext <b>{{
                    selectedStep.encrypted }}</b>.
                  {{ decrypting ? 'For decryption, find the ciphertext in this row and read the column heading.' : 'For encryption, read the intersection of that row and plaintext column.' }}
                </p>
              </div>
              <div v-else class="empty">Enter a message and a valid keyword to display the lookup table.</div>
            </section>

            <footer><span>LIGHTCIPHER://LOCAL</span>
              <p>Static cyan + magenta glitch styling · These classical ciphers are educational and not secure for
                sensitive information.</p>
            </footer>
          </div>
        </main>
      </IonContent>
    </IonPage>
  </IonApp>
</template>

<style>
:root {
  color-scheme: dark;
  --bg: #0d141a;
  --panel: #141e25;
  --line: #2b3c44;
  --ink: #e4ece9;
  --muted: #a3b8b3;
  --mint: #9ddfc3;
  --blue: #9bbfd8;
  --lilac: #baa9d4;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, Arial, sans-serif;
}

ion-content {
  --background: var(--bg);
}

.top-toolbar {
  --background: #10181e;
  --color: var(--ink);
}

.toolbar-inner {
  max-width: 1220px;
  min-height: 70px;
  padding: 0 20px;
  margin: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 43px;
  height: 43px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  border: 1px solid #4d796a;
  background: #1c302b;
  color: var(--mint);
  font: 700 17px ui-monospace, monospace;
}

.brand-name {
  color: var(--ink);
  font-size: 17px;
  letter-spacing: 1.2px;
}

.brand-name span {
  color: var(--mint);
}

.brand small {
  display: block;
  margin-top: 3px;
  color: var(--muted);
  font: 10px ui-monospace, monospace;
  letter-spacing: 1px;
}

.status {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  color: var(--muted);
  font: 11px ui-monospace, monospace;
  border: 1px solid var(--line);
  border-radius: 50px;
  white-space: nowrap;
}

.status i,
.result-status i {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 7px;
  background: #85bfaa;
  border-radius: 50%;
}

.shell {
  min-height: 100%;
  color: var(--ink);
  background: radial-gradient(ellipse at 85% 0%, rgba(130, 125, 177, .075), transparent 45%), linear-gradient(180deg, #101820, #0d141a);
  position: relative;
}

.shell::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .2;
  background-image: linear-gradient(#637e7a0c 1px, transparent 1px), linear-gradient(90deg, #637e7a0c 1px, transparent 1px);
  background-size: 32px 32px;
}

.page {
  max-width: 1220px;
  margin: 0 auto;
  padding: 22px 20px 32px;
  position: relative;
}

.hero {
  display: grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 18px;
  margin-bottom: 18px;
}

.hero-copy,
.terminal-preview,
.panel {
  background: rgba(20, 30, 37, .96);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 12px 34px rgba(0, 0, 0, .1);
}

.hero-copy {
  padding: 32px;
}

.eyebrow,
.kicker,
.preview-label {
  color: var(--blue);
  font: 11px ui-monospace, monospace;
  letter-spacing: 1px;
}

.hero h1 {
  font-size: clamp(31px, 4vw, 48px);
  line-height: 1.12;
  letter-spacing: -1.2px;
  margin: 15px 0;
}

.glitch-heading {
  text-shadow: 1px 0 rgba(137, 198, 191, .4), -1px 0 rgba(186, 169, 212, .38);
}

.hero h1 em {
  font-style: normal;
  color: var(--mint);
}

.hero p,
.section-head p,
.notes p {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.75;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 22px;
}

.tags span {
  border: 1px solid #36524e;
  border-radius: 20px;
  padding: 8px 10px;
  color: #c0d7cf;
  font: 10px ui-monospace, monospace;
}

.terminal-preview {
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.terminal-top {
  display: flex;
  justify-content: space-between;
  gap: 9px;
  align-items: center;
  color: var(--muted);
  font: 11px ui-monospace, monospace;
  border-bottom: 1px solid var(--line);
  padding-bottom: 14px;
}

.dots {
  color: var(--lilac);
  letter-spacing: 2px;
}

.terminal-live {
  color: var(--mint);
}

.terminal-label {
  display: block;
  color: var(--blue);
  font: 11px ui-monospace, monospace;
  margin-top: 19px;
}

.terminal-result {
  flex: 1;
  min-height: 85px;
  padding: 15px 0;
  color: var(--mint);
  font: 600 clamp(18px, 2.1vw, 28px) ui-monospace, monospace;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.terminal-foot {
  color: var(--muted);
  font: 11px ui-monospace, monospace;
  border-top: 1px solid var(--line);
  padding-top: 13px;
}

.workspace {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  align-items: stretch;
}

.panel {
  padding: 24px;
  min-width: 0;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 22px;
  padding-bottom: 19px;
}

.section-head h2 {
  font-size: 22px;
  letter-spacing: -.5px;
  margin: 9px 0 6px;
}

.section-head p {
  margin: 0;
}

.bracket {
  color: var(--lilac);
  font: 12px ui-monospace, monospace;
  white-space: nowrap;
}

.field {
  margin: 0 0 22px;
}

.field label,
.field-label {
  display: block;
  color: #d1e0da;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 10px;
}

.choice-row,
.segmented {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
}

.choice {
  display: flex;
  gap: 10px;
  align-items: center;
  text-align: left;
  background: #18252b;
  border: 1px solid #334750;
  color: var(--ink);
  border-radius: 12px;
  padding: 12px 10px;
  min-width: 0;
  cursor: pointer;
}

.choice.active {
  background: #203831;
  border-color: #648d7d;
}

.choice b {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  background: #263941;
  color: var(--blue);
  border-radius: 8px;
  font: 700 17px ui-monospace, monospace;
}

.choice.active b {
  color: var(--mint);
}

.choice strong,
.choice small {
  display: block;
}

.choice strong {
  font-size: 12px;
}

.choice small {
  font-size: 10px;
  color: var(--muted);
  margin-top: 3px;
}

.segmented {
  padding: 5px;
  background: #101b21;
  border: 1px solid var(--line);
  border-radius: 12px;
  gap: 5px;
}

.segmented button {
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--muted);
  padding: 12px;
  font-weight: 700;
}

.segmented button.active {
  color: var(--mint);
  border-color: #45685b;
  background: #1e332c;
}

.control,
.editor {
  width: 100%;
  outline: none;
  background: #101b21;
  border: 1px solid #354b53;
  border-radius: 12px;
  color: var(--ink);
}

.control {
  padding: 14px;
}

.control:focus,
.editor:focus {
  border-color: #8fcdb6;
}

.help,
.warning {
  display: block;
  font-size: 11px;
  margin-top: 9px;
  color: var(--muted);
  overflow-wrap: anywhere;
}

.help b {
  color: var(--mint);
}

.warning {
  color: #e8b9ac;
}

.slider-card {
  padding: 14px;
  border: 1px solid var(--line);
  background: #111c23;
  border-radius: 12px;
}

.slider-top,
.range-limits {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.slider-top>span,
.range-limits {
  color: var(--muted);
  font-size: 11px;
}

.slider-top>div {
  display: flex;
  align-items: center;
  gap: 5px;
}

.slider-top input {
  width: 55px;
  padding: 7px;
  text-align: center;
  color: var(--mint);
  background: #233830;
  border: 1px solid #4b7564;
  border-radius: 8px;
  font-size: 18px;
}

.slider-top small {
  color: var(--muted);
}

.range {
  width: 100%;
  accent-color: #9ddfc3;
  margin: 14px 0;
}

.range-limits {
  font-size: 10px;
}

.input-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.input-top div {
  display: flex;
  gap: 11px;
}

.input-top button {
  background: none;
  border: 0;
  color: var(--blue);
  cursor: pointer;
  font-size: 11px;
}

.editor {
  display: block;
  min-height: 138px;
  padding: 15px;
  font: 13px/1.7 ui-monospace, Consolas, monospace;
  resize: vertical;
}

.editor::placeholder {
  color: #7f958f;
}

.under-editor {
  text-align: right;
  color: var(--muted);
  margin-top: 8px;
  font: 11px ui-monospace, monospace;
}

.result-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px;
  margin-bottom: 18px;
  background: #1a2d2a;
  border: 1px solid #3b5750;
  border-radius: 12px;
  color: var(--mint);
  font: 11px ui-monospace, monospace;
}

.result-status span {
  white-space: nowrap;
}

.output-editor {
  min-height: 185px;
  color: #b4e2d0;
  background: #132420;
}

.action-row {
  display: flex;
  gap: 10px;
  margin: 18px 0;
}

.action-row ion-button {
  flex: 1;
  min-width: 0;
  height: 43px;
  margin: 0;
  font-size: 12px;
  font-weight: 700;
}

.button-copy {
  --background: #84bca5;
  --color: #101b19;
  --border-radius: 10px;
}

.button-reverse {
  --background: #293743;
  --color: #d3e1eb;
  --border-radius: 10px;
}

.feedback {
  color: var(--mint);
  font-size: 12px;
}

.notes {
  background: #192930;
  border: 1px solid #314950;
  border-radius: 12px;
  padding: 15px;
}

.notes strong {
  color: var(--blue);
  font: 11px ui-monospace, monospace;
}

.notes p {
  margin: 8px 0 0;
}

.caesar-preview {
  margin-top: 20px;
}

.preview-label {
  margin-bottom: 12px;
}

.alphabet-scroll {
  overflow-x: auto;
}

.letter-grid {
  display: grid;
  grid-template-columns: repeat(26, 30px);
  gap: 5px;
  min-width: max-content;
}

.letter-tile {
  display: flex;
  flex-direction: column;
  gap: 7px;
  align-items: center;
  text-align: center;
  font: 12px ui-monospace, monospace;
}

.letter-tile span,
.letter-tile strong {
  display: grid;
  place-items: center;
  width: 30px;
  height: 32px;
  background: #25333c;
  border-radius: 5px;
  color: var(--ink);
}

.letter-tile b {
  font-weight: 400;
  color: var(--muted);
}

.letter-tile strong {
  color: var(--mint);
  background: #1b3830;
}

.matrix-panel {
  margin-top: 18px;
}

.steps {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 18px;
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #3a4d56;
  background: #17262e;
  color: var(--ink);
  border-radius: 9px;
  padding: 8px 10px;
  cursor: pointer;
}

.step small {
  color: var(--muted);
}

.step span {
  color: var(--lilac);
}

.step.active {
  background: #274139;
  border-color: #88bba6;
}

.step-details {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.step-details div {
  background: #17262c;
  border: 1px solid var(--line);
  border-radius: 11px;
  padding: 13px;
}

.step-details small {
  display: block;
  font: 10px ui-monospace, monospace;
  color: var(--muted);
  margin-bottom: 6px;
}

.step-details strong {
  color: var(--mint);
  font: 700 21px ui-monospace, monospace;
}

.matrix-scroll {
  overflow: auto;
  max-height: 520px;
  border: 1px solid var(--line);
  border-radius: 10px;
}

.matrix {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  min-width: 965px;
  font: 12px ui-monospace, monospace;
  text-align: center;
}

.matrix td,
.matrix th {
  min-width: 34px;
  height: 31px;
  padding: 7px;
  border-right: 1px solid #2b3a40;
  border-bottom: 1px solid #2b3a40;
}

.matrix th {
  background: #25343b;
  color: #d7e5df;
}

.matrix thead th {
  position: sticky;
  top: 0;
  z-index: 2;
}

.matrix tbody th {
  position: sticky;
  left: 0;
  z-index: 1;
}

.matrix .corner {
  position: sticky;
  left: 0;
  top: 0;
  min-width: 128px;
  z-index: 3;
  font-size: 10px;
}

.matrix td {
  color: #c5d6d0;
  background: #142229;
}

.matrix .row-focus,
.matrix .col-focus {
  background: #50675e;
  color: #fff;
}

.matrix .row-line {
  background: #1c3832;
}

.matrix .col-line {
  background: #28353e;
}

.matrix .intersection {
  background: #587b6d !important;
  color: #fff;
  font-weight: 800;
  outline: 2px solid #c4edda;
  outline-offset: -2px;
}

.matrix-explain {
  padding: 15px;
  margin: 16px 0 0;
  background: #1a2a31;
  border: 1px solid #3a5158;
  border-radius: 12px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.8;
}

.matrix-explain strong,
.matrix-explain b {
  color: #d1e8dc;
}

.empty {
  padding: 30px;
  text-align: center;
  color: var(--muted);
  background: #19252b;
  border-radius: 12px;
}

footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  margin-top: 23px;
  padding: 20px 0;
  border-top: 1px solid var(--line);
}

footer span {
  color: var(--mint);
  font: 11px ui-monospace, monospace;
}

footer p {
  color: var(--muted);
  margin: 0;
  font-size: 11px;
  text-align: right;
}

button:focus-visible,
input:focus-visible,
textarea:focus-visible,
.matrix-scroll:focus-visible {
  outline: 2px solid var(--mint);
  outline-offset: 2px;
}

@media(max-width:900px) {

  .hero,
  .workspace {
    grid-template-columns: 1fr;
  }
}

@media(max-width:600px) {
  .toolbar-inner {
    padding: 0 12px;
  }

  .brand-name {
    font-size: 15px;
  }

  .brand small {
    font-size: 8px;
  }

  .status {
    font-size: 0;
    padding: 9px;
  }

  .page {
    padding: 13px 12px 25px;
  }

  .hero-copy,
  .terminal-preview,
  .panel {
    padding: 18px;
    border-radius: 14px;
  }

  .choice-row {
    grid-template-columns: 1fr;
  }

  .step-details {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-row {
    flex-direction: column;
  }

  footer {
    align-items: flex-start;
    flex-direction: column;
  }

  footer p {
    text-align: left;
  }
}

@media(prefers-reduced-motion:reduce) {

  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}

/* ===== PhANTOMCIPHER / static glitch × cyber-analyst fusion ===== */
:root {
  color-scheme: dark;
  --bg: #0f0c20;
  --panel: #19162d;
  --line: #3b3658;
  --ink: #ece7f8;
  --muted: #b2aacd;
  --mint: #99e1d9;
  --blue: #99b3f0;
  --lilac: #f0a8d3;
  --pink: #e994c2;
}

body {
  background: var(--bg);
}

ion-content {
  --background: var(--bg);
}

.top-toolbar {
  --background: #131024;
}

.toolbar-inner {
  min-height: 74px;
}

.brand-mark {
  border-color: #6968a7;
  border-radius: 3px 11px 3px 11px;
  background: linear-gradient(135deg, #292447, #191a35);
  color: #a7e4da;
  box-shadow: -3px 3px 0 #6b4f91;
}

.brand-name {
  font-size: 18px;
  letter-spacing: 1.6px;
  text-shadow: 1px 0 #6c9ec755, -1px 0 #df7dac44;
}

.brand-name span {
  color: #ed9ac7;
}

.brand small {
  color: #aca3c5;
}

.status {
  border-color: #4c4267;
  background: #19162c;
  color: #a9c9d6;
}

.status i,
.result-status i {
  background: #92dacc;
}

.shell {
  background:
    radial-gradient(ellipse at 70% 0%, #47407726, transparent 52%),
    radial-gradient(circle at 8% 16%, #a64e8720, transparent 38%),
    linear-gradient(180deg, #110e24, #0e0b1d);
}

.shell::before {
  opacity: .48;
  background-image:
    linear-gradient(#7770a414 1px, transparent 1px),
    linear-gradient(90deg, #7770a414 1px, transparent 1px);
  background-size: 62px 62px;
}

.page {
  max-width: 1280px;
}

.hero {
  grid-template-columns: 1fr 1.04fr;
  margin-bottom: 22px;
  gap: 14px;
  position: relative;
}

.hero-copy,
.hero-visual,
.panel {
  background: rgba(24, 20, 43, .96);
  border: 1px solid #393151;
  border-radius: 15px;
  box-shadow: 0 16px 45px #0604113d;
  min-width: 0;
  position: relative;
}

.neon-frame:before {
  content: '';
  position: absolute;
  top: -1px;
  left: 26px;
  width: 130px;
  height: 3px;
  z-index: 3;
  background: linear-gradient(90deg, #7fd6df, #8d8bdc, transparent);
  pointer-events: none;
}

.neon-frame:after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 42px;
  width: 110px;
  height: 3px;
  z-index: 3;
  background: linear-gradient(90deg, transparent, #ee8ebd, #9e82d3);
  pointer-events: none;
}

.hero-copy {
  padding: clamp(24px, 4vw, 46px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-copy:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 95px;
  background: linear-gradient(#8cd6e4, #9b8ed6);
  opacity: .8;
}

.hero-copy:after {
  content: '';
  position: absolute;
  bottom: 26px;
  right: 24px;
  width: 64px;
  height: 50px;
  background:
    linear-gradient(#db83b9, #db83b9) 0 0/26px 3px no-repeat,
    linear-gradient(#88cfe3, #88cfe3) right 18px/42px 3px no-repeat,
    linear-gradient(#8580c2, #8580c2) right bottom/18px 3px no-repeat;
  opacity: .55;
  pointer-events: none;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 10px;
  letter-spacing: 1.2px;
  color: #8ed9e3;
}

.tiny-cross {
  color: #e995c2;
  font-size: 15px;
}

.eyebrow-line {
  display: inline-block;
  width: 40px;
  height: 1px;
  background: #f09ac5;
}

.hero-version {
  margin-top: 22px;
  color: #b19fce;
  font: 11px ui-monospace, monospace;
  letter-spacing: 1px;
}

.hero h1 {
  font-size: clamp(35px, 5vw, 62px);
  line-height: 1.12;
  margin: 16px 0 19px;
  letter-spacing: -2px;
}

.glitch-heading {
  text-shadow: 1.5px 0 #85e2de66, -1.5px 0 #e58bc044;
}

.hero h1 em {
  display: inline-block;
  color: #f0a5cf;
  font-style: normal;
}

.hero-period {
  color: #91dfe1;
}

.hero-copy p {
  max-width: 560px;
  font-size: 14px;
  line-height: 1.9;
  color: #b8b1d0;
}

.tags {
  margin-top: 21px;
}

.tags span {
  border-radius: 4px 10px 4px 10px;
  background: #231f3a;
  color: #cbd1f1;
  border-color: #584876;
  padding: 9px 11px;
}

.hero-system {
  border-top: 1px solid #423957;
  margin-top: 30px;
  padding-top: 16px;
  color: #9bacc9;
  letter-spacing: 1px;
  font: 10px ui-monospace, monospace;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.system-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #94d9d0;
}

.hero-pipe {
  color: #ee93c8;
}

.hero-visual {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #16122a;
  border-color: #544276;
}

.hero-visual:before {
  content: '';
  z-index: 2;
  position: absolute;
  right: 18px;
  top: 18px;
  width: 18px;
  height: 18px;
  border-right: 3px solid #ef91c5;
  border-top: 3px solid #ef91c5;
  pointer-events: none;
}

.hacker-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 43px;
  padding: 0 18px;
  gap: 10px;
  font: 10px ui-monospace, monospace;
  color: #aeb2dc;
  background: #211c38;
  border-bottom: 1px solid #493f6c;
}

.window-dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.window-dots i {
  display: block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #9c8fbe;
}

.window-dots i:nth-child(1) {
  background: #ec9cc4;
}

.window-dots i:nth-child(2) {
  background: #a3b0e6;
}

.window-dots i:nth-child(3) {
  background: #89d9dc;
}

.hacker-art {
  width: 100%;
  display: block;
  min-height: 250px;
  max-height: 380px;
  object-fit: contain;
}

.art-terminal {
  display: flex;
  gap: 13px;
  align-items: center;
  padding: 13px 17px;
  background: #201a35;
  border-top: 1px solid #58426d;
  min-width: 0;
}

.terminal-caret {
  color: #9be0e0;
  font: 700 16px ui-monospace, monospace;
}

.art-terminal div {
  flex: 1;
  min-width: 0;
}

.art-terminal small {
  display: block;
  color: #b59fc5;
  font: 10px ui-monospace, monospace;
  margin-bottom: 4px;
  letter-spacing: 1px;
}

.art-terminal strong {
  display: block;
  color: #a4e5dc;
  font: 700 14px ui-monospace, monospace;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.art-signal {
  color: #c5a1cf;
  white-space: nowrap;
  font: 10px ui-monospace, monospace;
}

/* Small, static magenta/cyan geometric corner fragments around content */
.panel {
  border-color: #413959;
  border-radius: 14px;
  background: #19162ceF;
}

.panel::before {
  content: '';
  position: absolute;
  left: 15px;
  top: -1px;
  width: 78px;
  height: 2px;
  background: #85d5e0;
  opacity: .75;
  pointer-events: none;
}

.panel::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 18px;
  width: 57px;
  height: 2px;
  background: #e08cb8;
  opacity: .75;
  pointer-events: none;
}

.section-head {
  border-color: #433856;
}

.section-head h2 {
  color: #f1eaf7;
}

.section-head p,
.notes p {
  color: #b5aecc;
}

.kicker,
.preview-label {
  color: #92cddf;
}

.bracket {
  color: #e9a0ca;
}

.field label,
.field-label {
  color: #e1d8ef;
}

.choice {
  background: #201d35;
  border-color: #4d4564;
}

.choice.active {
  background: #292340;
  border-color: #9f78a8;
  box-shadow: inset 3px 0 #d593c2;
}

.choice b {
  background: #312b4a;
  color: #96c9e8;
}

.choice.active b {
  color: #f1b0d8;
}

.choice small {
  color: #aea6c7;
}

.segmented {
  background: #151326;
  border-color: #423956;
}

.segmented button {
  color: #aaa4c4;
}

.segmented button.active {
  color: #f3b7dd;
  background: #332540;
  border-color: #725578;
}

.control,
.editor {
  background: #121222;
  border-color: #514762;
  color: #eeeaf7;
}

.control:focus,
.editor:focus {
  border-color: #9ed8e4;
}

.help,
.range-limits,
.slider-top>span,
.under-editor {
  color: #ada7c4;
}

.help b,
.feedback {
  color: #9cdbda;
}

.warning {
  color: #f0b2bc;
}

.slider-card {
  background: #19172d;
  border-color: #483f60;
}

.slider-top input {
  background: #2f2842;
  color: #b6e3e8;
  border-color: #71648f;
}

.range {
  accent-color: #b8a2e9;
}

.input-top button {
  color: #a5dbeb;
}

.editor::placeholder {
  color: #8981a2;
}

.result-status {
  background: #29213a;
  border-color: #67476d;
  color: #f0b2db;
}

.result-status i {
  background: #df9dcc;
}

.output-editor {
  color: #bdeae6;
  background: #17182b;
  min-height: 190px;
}

.button-copy {
  --background: #8bd6d5;
  --color: #11172b;
  --border-radius: 8px;
}

.button-reverse {
  --background: #3a2b51;
  --color: #f1c7e2;
  --border-radius: 8px;
}

.notes {
  background: #201c35;
  border-color: #443d5a;
}

.notes strong {
  color: #d3a4db;
}

.caesar-preview .letter-tile span {
  background: #2a2742;
  color: #e2d9f1;
}

.caesar-preview .letter-tile strong {
  background: #27394b;
  color: #a7e4e1;
}

.letter-tile b {
  color: #9e93b8;
}

.step {
  background: #211d38;
  border-color: #504367;
}

.step.active {
  background: #392640;
  border-color: #d28fbb;
}

.step small {
  color: #aaa1c2;
}

.step span {
  color: #edabda;
}

.step-details div {
  background: #221c36;
  border-color: #473b60;
}

.step-details small {
  color: #b8adc8;
}

.step-details strong {
  color: #afdfe4;
}

.matrix-scroll {
  border-color: #4d405f;
  scrollbar-color: #73628e #1c172f;
}

.matrix td,
.matrix th {
  border-right-color: #352b4a;
  border-bottom-color: #352b4a;
}

.matrix th {
  background: #292341;
  color: #e5dcef;
}

.matrix td {
  background: #1e1933;
  color: #d1cbe4;
}

.matrix .row-focus {
  background: #4a3865;
  color: #f9d8eb;
}

.matrix .col-focus {
  background: #2f5262;
  color: #d2f4f5;
}

.matrix .row-line {
  background: #382949;
}

.matrix .col-line {
  background: #28364c;
}

.matrix .intersection {
  background: #765478 !important;
  color: #fff;
  outline: 2px solid #d8a8db;
}

.matrix-explain {
  background: #241d39;
  border-color: #594365;
  color: #b9b3d2;
}

.matrix-explain strong,
.matrix-explain b {
  color: #e9bedc;
}

.empty {
  background: #211b35;
  color: #b8a9ca;
}

footer {
  border-color: #403656;
}

footer span {
  color: #dfadd0;
}

footer p {
  color: #aaa1c1;
}

button:focus-visible,
input:focus-visible,
textarea:focus-visible,
.matrix-scroll:focus-visible {
  outline: 2px solid #b2e5e4;
}

@media(max-width:950px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hacker-art {
    max-height: 340px;
  }
}

@media(max-width:600px) {
  .page {
    padding: 13px 12px 28px;
  }

  .brand-name {
    font-size: 14px;
  }

  .hero-copy {
    padding: 25px 20px;
  }

  .hero h1 {
    font-size: 38px;
  }

  .hero-visual {
    border-radius: 12px;
  }

  .hero-system {
    font-size: 9px;
  }

  .art-signal {
    display: none;
  }

  .hacker-art {
    min-height: 190px;
  }

  .panel {
    padding: 18px;
  }

  .choice-row {
    grid-template-columns: 1fr;
  }
}

@media(prefers-reduced-motion:reduce) {

  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}
</style>

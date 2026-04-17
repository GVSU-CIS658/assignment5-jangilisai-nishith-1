<template>
  <div id="app">
    <Beverage :isIced="beverageStore.currentTemp === 'Cold'" />

    <ul>
      <li>
        <template v-for="temp in beverageStore.temps" :key="temp">
          <label>
            <input
              type="radio"
              name="temperature"
              :value="temp"
              v-model="beverageStore.currentTemp"
            />
            {{ temp }}
          </label>
        </template>
      </li>
    </ul>

    <ul>
      <li>
        <template v-for="b in beverageStore.bases" :key="b.id">
          <label>
            <input
              type="radio"
              name="bases"
              :value="b"
              v-model="beverageStore.currentBase"
            />
            {{ b.name }}
          </label>
        </template>
      </li>
    </ul>

    <ul>
      <li>
        <template v-for="s in beverageStore.syrups" :key="s.id">
          <label>
            <input
              type="radio"
              name="syrups"
              :value="s"
              v-model="beverageStore.currentSyrup"
            />
            {{ s.name }}
          </label>
        </template>
      </li>
    </ul>

    <ul>
      <li>
        <template v-for="c in beverageStore.creamers" :key="c.id">
          <label>
            <input
              type="radio"
              name="creamers"
              :value="c"
              v-model="beverageStore.currentCreamer"
            />
            {{ c.name }}
          </label>
        </template>
      </li>
    </ul>

    <div>
      <span v-if="loggedIn">Logged in as {{ beverageStore.user?.displayName }}</span>
      <button v-if="!loggedIn" @click="withGoogle">Sign in with Google</button>
      <button v-if="loggedIn" @click="logout">Sign out</button>
    </div>

    <input
      v-model="beverageStore.currentName"
      type="text"
      placeholder="Beverage Name"
      :disabled="!loggedIn"
    />

    <button @click="makeDrink" :disabled="!loggedIn">
      🍺 Make Beverage
    </button>

    <div v-if="tempName">{{ tempName }}</div>

    <div v-if="loggedIn">
      <ul>
        <li v-for="drink in beverageStore.beverages" :key="drink.id">
          <button @click="beverageStore.showBeverage(drink)">
            {{ drink.name }}
          </button>
        </li>
      </ul>
    </div>

    <div v-if="!loggedIn">Sign in to save a Beverage</div>
    <div v-if="err">{{ err }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Beverage from "./components/Beverage.vue"
import { useBeverageStore } from "./stores/beverageStore"
import { auth } from "./firebase"
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth'

const loggedIn = ref(false)
const beverageStore = useBeverageStore()
const err = ref("")
const tempName = ref("")

onMounted(() => {
  beverageStore.init()

  onAuthStateChanged(auth, (user) => {
    beverageStore.setUser(user)
    loggedIn.value = !!user
  })
})

const withGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  } catch (error: any) {
    err.value = error.message
  }
}

const logout = async () => {
  await signOut(auth)
}

const makeDrink = () => {
  tempName.value = beverageStore.makeBeverage()
  setTimeout(() => {
    tempName.value = ""
  }, 3000)
}
</script>

<style lang="scss">
body,
html {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background-color: #6e4228;
  background: linear-gradient(to bottom, #6e4228 0%, #956f5a 100%);
}

#app {
  display: flex;
  flex-direction: column;
  align-items: center;
}

ul {
  list-style: none;
}
</style>

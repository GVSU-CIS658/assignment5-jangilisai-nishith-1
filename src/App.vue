<template>
  <div id="app">
    <div class="container">
      
      <Beverage :isIced="beverageStore.currentTemp === 'Cold'" />

      <h4>Temperature</h4>
      <div class="row">
        <label v-for="temp in beverageStore.temps" :key="temp">
          <input type="radio" :value="temp" v-model="beverageStore.currentTemp" />
          {{ temp }}
        </label>
      </div>

      <h4>Base</h4>
      <div class="row">
        <label v-for="b in beverageStore.bases" :key="b.id">
          <input type="radio" :value="b" v-model="beverageStore.currentBase" />
          {{ b.name }}
        </label>
      </div>

      <h4>Syrup</h4>
      <div class="row">
        <label v-for="s in beverageStore.syrups" :key="s.id">
          <input type="radio" :value="s" v-model="beverageStore.currentSyrup" />
          {{ s.name }}
        </label>
      </div>

      <h4>Creamer</h4>
      <div class="row">
        <label v-for="c in beverageStore.creamers" :key="c.id">
          <input type="radio" :value="c" v-model="beverageStore.currentCreamer" />
          {{ c.name }}
        </label>
      </div>

      <div class="auth">
        <span v-if="loggedIn">
          Logged in as {{ beverageStore.user?.displayName }}
        </span>
        <button v-if="!loggedIn" @click="withGoogle">
          Sign in with Google
        </button>
        <button v-if="loggedIn" @click="logout">
          Sign out
        </button>
      </div>

      <input
        v-model="beverageStore.currentName"
        placeholder="Beverage Name"
        :disabled="!loggedIn"
      />

      <button @click="makeDrink" :disabled="!loggedIn">
        Make Beverage
      </button>

      <div v-if="message">{{ message }}</div>

      <div v-if="loggedIn">
        <h4>Saved Beverages</h4>
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Beverage from "./components/Beverage.vue";
import { useBeverageStore } from "./stores/beverageStore";
import { auth } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const beverageStore = useBeverageStore();
const loggedIn = ref(false);
const err = ref("");
const message = ref("");

onMounted(() => {
  beverageStore.init();

  onAuthStateChanged(auth, (user) => {
    beverageStore.setUser(user);
    loggedIn.value = !!user;
  });
});

const withGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (e: any) {
    err.value = e.message;
  }
};

const logout = async () => {
  await signOut(auth);
};

const makeDrink = () => {
  message.value = beverageStore.makeBeverage();
  setTimeout(() => (message.value = ""), 3000);
};
</script>

<style>
body {
  margin: 0;
  min-height: 100vh;
  background: linear-gradient(to bottom, #6e4228, #956f5a);
  font-family: Arial, sans-serif;
}

#app {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}

.container {
  width: 420px;
  color: white;
  text-align: center;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 10px;
}

.auth {
  margin-top: 15px;
}

input {
  width: 100%;
  margin-top: 10px;
  padding: 6px;
}

button {
  margin-top: 10px;
  padding: 6px 10px;
}
</style>

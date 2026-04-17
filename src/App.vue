<template>
  <div>
    <Beverage :isIced="beverageStore.currentTemp === 'Cold'" />
    <ul>
      <li>
        <template v-for="temp in beverageStore.temps" :key="temp">
          <label>
            <input
              type="radio"
              name="temperature"
              :id="`r${temp}`"
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
              :id="`r${b.id}`"
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
              :id="`r${s.id}`"
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
              :id="`r${c.id}`"
              :value="c"
              v-model="beverageStore.currentCreamer"
            />
            {{ c.name }}
          </label>
        </template>
      </li>
    </ul>
    <div>
      <template v-if="loggedIn">Logged in as {{ beverageStore.user?.displayName }}</template>
      <button @click="withGoogle" v-if="!loggedIn">Sign in with Google</button>
      <button @click="logout" v-if="loggedIn">Sign out</button>
    </div>
    <input v-model="beverageStore.currentName" type="text" placeholder="Beverage Name" :disabled="!loggedIn" />
    <button @click="makeDrink":disabled="!loggedIn" >🍺 Make Beverage</button>
    <div v-if="tempName"> {{tempName}} </div>
    <div>
      <ul v-for="drink in beverageStore.beverages" :key="drink.id">
        <li ><button @click="beverageStore.showBeverage(drink)">{{ drink.name }}</button></li>
      </ul>
    </div>
    <div v-if="!loggedIn">Sign in to save a Beverage</div>
    <div v-if="err">{{ err }}</div>
  </div>

  <div id="beverage-container" style="margin-top: 20px"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Beverage from "./components/Beverage.vue";
import { useBeverageStore } from "./stores/beverageStore";
import {auth} from "./firebase.ts";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth'
const loggedIn =ref(false);
const beverageStore = useBeverageStore();
const err = ref("");
const tempName = ref("");
onMounted(() => {
  beverageStore.init();
});

const withGoogle = () => {
  try{
      const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);

    onAuthStateChanged(auth, (firebaseUser) => {
      beverageStore.setUser(firebaseUser);
    })
    loggedIn.value = true;
  }catch(error: any){
    err.value = error?.code;
  }

}

const logout = () => {
  loggedIn.value = false;
  signOut(auth);
  beverageStore.setUser(null);
  beverageStore.clearBeverages();

}

const makeDrink = () => {
  tempName.value = beverageStore.makeBeverage();

  setTimeout(() => {tempName.value = "";}, 3000);
};
</script>

<style lang="scss">
body,
html {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #6e4228;
  background: linear-gradient(to bottom, #6e4228 0%, #956f5a 100%);
}
ul {
  list-style: none;
}
</style>

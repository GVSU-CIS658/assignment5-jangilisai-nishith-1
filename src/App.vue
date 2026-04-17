<template>
  <div>
    <Beverage :isIced="beverageStore.currentTemp === 'Cold'" />

    <ul>
      <li>
        <template v-for="temp in beverageStore.temps" :key="temp">
          <label>
            <input type="radio" name="temperature" :id="`r${temp}`" :value="temp" v-model="beverageStore.currentTemp" />
            {{ temp }}
          </label>
        </template>
      </li>
    </ul>
    <ul>
      <li>
        <template v-for="b in beverageStore.bases" :key="b.id">
          <label>
            <input type="radio" name="bases" :id="`r${b.id}`" :value="b" v-model="beverageStore.currentBase" />
            {{ b.name }}
          </label>
        </template>
      </li>
    </ul>
    <ul>
      <li>
        <template v-for="s in beverageStore.syrups" :key="s.id">
          <label>
            <input type="radio" name="syrups" :id="`r${s.id}`" :value="s" v-model="beverageStore.currentSyrup" />
            {{ s.name }}
          </label>
        </template>
      </li>
    </ul>
    <ul>
      <li>
        <template v-for="c in beverageStore.creamers" :key="c.id">
          <label>
            <input type="radio" name="creamers" :id="`r${c.id}`" :value="c" v-model="beverageStore.currentCreamer" />
            {{ c.name }}
          </label>
        </template>
      </li>
    </ul>

    <div class="auth-row">
      <div v-if="beverageStore.user" class="auth-signed-in">
        <p>Signed in as: {{ beverageStore.user.displayName || beverageStore.user.email }}</p>
        <button @click="signOut">Sign Out</button>
      </div>
      <div v-else>
        <button @click="withGoogle">Sign in with Google</button>
      </div>
    </div>

    <input type="text" placeholder="Beverage Name" v-model="beverageStore.currentName" />
    <button @click="handleMakeBeverage" :disabled="!beverageStore.user">🍺 Make Beverage</button>
    <p v-if="message">{{ message }}</p>

    <div v-if="beverageStore.user && filteredBeverages.length > 0">
      <ul class="saved-beverages">
        <li v-for="bev in filteredBeverages" :key="bev.id">
          <label class="selected">
            <input type="radio" :name="`savedBeverage_${bev.id}`" :checked="true"
              @change="beverageStore.loadBeverage(bev)" />
            {{ bev.name }}
          </label>
        </li>
      </ul>
    </div>
  </div>
  <div id="beverage-container"></div>
</template>

<script setup lang="ts">
import Beverage from "./components/Beverage.vue";
import { useBeverageStore } from "./stores/beverageStore";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import { ref, computed } from "vue";

const beverageStore = useBeverageStore();
const message = ref("");

const filteredBeverages = computed(() => {
  if (!beverageStore.currentBeverage) return [];
  return beverageStore.beverages.filter(
    (bev) => bev.name.toLowerCase() === beverageStore.currentBeverage!.name.toLowerCase(),
  );
});

onAuthStateChanged(auth, (currentUser) => {
  beverageStore.setUser(currentUser);
});

const withGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    message.value = "Sign-in failed: " + (error.message || "Unknown error");
  }
};

const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    message.value = "Sign-out failed: " + (error.message || "Unknown error");
  }
};

const handleMakeBeverage = async () => {
  message.value = await beverageStore.makeBeverage();
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

#beverage-container {
  margin-top: 20px;
}

.auth-signed-in {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;

  p {
    margin: 0;
  }
}

.saved-beverages {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;

  label {
    cursor: pointer;
    padding: 0.25rem 0.5rem;
  }
}
</style>

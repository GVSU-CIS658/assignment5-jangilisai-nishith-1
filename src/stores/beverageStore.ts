import { defineStore } from "pinia";
import {
  BaseBeverageType,
  CreamerType,
  SyrupType,
  BeverageType,
} from "../types/beverage";
import tempretures from "../data/tempretures.json";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  onSnapshot,
  query,
  where,
  Unsubscribe,
  deleteDoc,
} from "firebase/firestore";
import { User } from "firebase/auth";

let unsubscribeBeverages: Unsubscribe | null = null;

export const useBeverageStore = defineStore("BeverageStore", {
  state: () => ({
    temps: tempretures,
    currentTemp: tempretures[0],
    bases: [] as BaseBeverageType[],
    currentBase: null as BaseBeverageType | null,
    syrups: [] as SyrupType[],
    currentSyrup: null as SyrupType | null,
    creamers: [] as CreamerType[],
    currentCreamer: null as CreamerType | null,
    beverages: [] as BeverageType[],
    currentBeverage: null as BeverageType | null,
    currentName: "",
    user: null as User | null,
  }),

  actions: {
    async init() {
      const basesSnap = await getDocs(collection(db, "bases"));
      this.bases = basesSnap.docs.map((doc) => doc.data() as BaseBeverageType);
      this.currentBase = this.bases[0] ?? null;

      const syrupsSnap = await getDocs(collection(db, "syrups"));
      this.syrups = syrupsSnap.docs.map((doc) => doc.data() as SyrupType);
      this.currentSyrup = this.syrups[0] ?? null;

      const creamersSnap = await getDocs(collection(db, "creamers"));
      this.creamers = creamersSnap.docs.map((doc) => doc.data() as CreamerType);
      this.currentCreamer = this.creamers[0] ?? null;
    },

    setUser(user: User | null) {
      this.user = user;

      if (unsubscribeBeverages) {
        unsubscribeBeverages();
        unsubscribeBeverages = null;
      }

      if (!user) {
        this.beverages = [];
        this.currentBeverage = null;
        return;
      }

      const q = query(
        collection(db, "beverages"),
        where("userId", "==", user.uid),
      );

      unsubscribeBeverages = onSnapshot(q, (snapshot) => {
        this.beverages = snapshot.docs.map((doc) => doc.data() as BeverageType);
      });
    },

    async makeBeverage(): Promise<string> {
      if (!this.user) return "No user logged in, please sign in first.";

      if (
        !this.currentBase ||
        !this.currentSyrup ||
        !this.currentCreamer ||
        !this.currentName.trim()
      ) {
        return "Please complete all beverage options and the name before making a beverage.";
      }

      const newTemp = this.currentTemp;
      const newBase = this.currentBase!;
      const newSyrup = this.currentSyrup!;
      const newCreamer = this.currentCreamer!;
      const uid = this.user.uid;

      const newName = this.currentName.trim();
      const sameRecipe = this.beverages.filter(
        (bev) => bev.name.toLowerCase() === newName.toLowerCase(),
      );

      if (unsubscribeBeverages) {
        unsubscribeBeverages();
        unsubscribeBeverages = null;
      }

      const existing = query(
        collection(db, "beverages"),
        where("userId", "==", uid),
      );
      const snapshot = await getDocs(existing);
      await Promise.all(
        snapshot.docs.map((d) => deleteDoc(doc(db, "beverages", d.id))),
      );

      await Promise.all(
        sameRecipe.map((bev) =>
          setDoc(doc(db, "beverages", bev.id), { ...bev, userId: uid }),
        ),
      );

      const id = `${uid}_${Date.now()}`;
      const beverage: BeverageType & { userId: string } = {
        id,
        name: this.currentName.trim(),
        temp: newTemp,
        base: newBase,
        syrup: newSyrup,
        creamer: newCreamer,
        userId: uid,
      };
      await setDoc(doc(db, "beverages", id), beverage);

      const q = query(collection(db, "beverages"), where("userId", "==", uid));
      unsubscribeBeverages = onSnapshot(q, (snap) => {
        this.beverages = snap.docs.map((d) => d.data() as BeverageType);
      });

      this.currentBeverage = beverage;
      this.currentName = "";
      return `Beverage ${beverage.name} made successfully!`;
    },

    showBeverage() {},

    loadBeverage(bev: BeverageType) {
      this.currentTemp = bev.temp;
      this.currentBase = bev.base;
      this.currentSyrup = bev.syrup;
      this.currentCreamer = bev.creamer;
      this.currentBeverage = bev;
    },
  },
});

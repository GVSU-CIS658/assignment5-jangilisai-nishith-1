import { defineStore } from "pinia";
import {
  BaseBeverageType,
  CreamerType,
  SyrupType,
  BeverageType,
  BeverageDocType,
} from "../types/beverage";
import tempretures from "../data/tempretures.json";
import db from "../firebase.ts";

import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  addDoc,
} from "firebase/firestore";

import type { User } from "firebase/auth";

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
    unsubscribeBeverages: null as null | (() => void),
  }),

  actions: {
    // READ
    init() {
      const basesCol = collection(db, "bases");
      const syrupsCol = collection(db, "syrups");
      const creamersCol = collection(db, "creamers");

      getDocs(basesCol).then((qs) => {
        this.bases = qs.docs.map((qd) => ({
          id: qd.id,
          ...qd.data(),
        })) as BaseBeverageType[];

        this.currentBase = this.bases[0] ?? null;
      });

      getDocs(syrupsCol).then((qs) => {
        this.syrups = qs.docs.map((qd) => ({
          id: qd.id,
          ...qd.data(),
        })) as SyrupType[];

        this.currentSyrup = this.syrups[0] ?? null;
      });

      getDocs(creamersCol).then((qs) => {
        this.creamers = qs.docs.map((qd) => ({
          id: qd.id,
          ...qd.data(),
        })) as CreamerType[];

        this.currentCreamer = this.creamers[0] ?? null;
      });
    },

    // READ
    setUser(user: User | null) {
      this.user = user;

      if (this.unsubscribeBeverages) {
        this.unsubscribeBeverages();
        this.unsubscribeBeverages = null;
      }

      if (!user) {
        this.beverages = [];
        this.currentBeverage = null;
        return;
      }

      const beveragesQuery = query(
        collection(db, "beverages"),
        where("userId", "==", user.uid)
      );

      this.unsubscribeBeverages = onSnapshot(beveragesQuery, (snapshot) => {
        this.beverages = snapshot.docs.map((doc) => {
          const data = doc.data() as BeverageDocType;

          return {
            id: doc.id,
            name: data.name,
            temp: data.temp,
            base: data.base,
            syrup: data.syrup,
            creamer: data.creamer,
          };
        }) as BeverageType[];

        if (!this.currentBeverage) {
          this.currentBeverage = this.beverages[0] ?? null;
          return;
        }

        const updated = this.beverages.find(
          (b) => b.id === this.currentBeverage?.id
        );

        this.currentBeverage = updated ?? this.beverages[0] ?? null;
      });
    },

    // CREATE
    makeBeverage(name: string) {
      if (!this.user) {
        return Promise.resolve(
          "No user logged in, please sign in first."
        );
      }

      if (
        !name.trim() ||
        !this.currentBase ||
        !this.currentSyrup ||
        !this.currentCreamer ||
        !this.currentTemp
      ) {
        return Promise.resolve(
          "Please complete all beverage options and the name before making a beverage."
        );
      }

      const newBeverage: BeverageDocType = {
        name: name.trim(),
        temp: this.currentTemp,
        base: this.currentBase,
        syrup: this.currentSyrup,
        creamer: this.currentCreamer,
        userId: this.user.uid,
      };

      return addDoc(collection(db, "beverages"), newBeverage)
        .then(() => {
          this.currentName = newBeverage.name;
          return `Beverage "${newBeverage.name}" made successfully!`;
        })
        .catch(() => {
          return "Failed to create beverage.";
        });
    },

    showBeverage(id: string) {
      const beverage = this.beverages.find((bev) => bev.id === id);
      if (!beverage) return;

      this.currentTemp = beverage.temp;
      this.currentBase = beverage.base;
      this.currentSyrup = beverage.syrup;
      this.currentCreamer = beverage.creamer;
      this.currentName = beverage.name;
      this.currentBeverage = beverage;
    },
  },
});

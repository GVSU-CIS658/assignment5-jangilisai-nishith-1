import { defineStore } from "pinia";
import {
  BaseBeverageType,
  CreamerType,
  SyrupType,
  BeverageType,
} from "../types/beverage";
import tempretures from "../data/tempretures.json";
import { db } from "../firebase.ts";
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { type User } from "firebase/auth";

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
    init() {
      onSnapshot(collection(db, "bases"), (snapshot) => {
        this.bases = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            color: data.color,
          };
        });
        this.currentBase = this.bases[0];
      });

      onSnapshot(collection(db, "creamers"), (snapshot) => {
        this.creamers = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            color: data.color,
          };
        });
        this.currentCreamer = this.creamers[0];
      });

      onSnapshot(collection(db, "syrups"), (snapshot) => {
        this.syrups = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            color: data.color,
          };
        });
        this.currentSyrup = this.syrups[0];
      });
    },

    setUser(user: User | null) {
      this.user = user;

      if (!user) {
        this.beverages = [];
        return;
      }

      this.showBeverages();
    },

    makeBeverage() {
      if (!this.user) {
        return "No user logged in, please sign in first.";
      }

      if (
        !this.currentName ||
        !this.currentBase ||
        !this.currentCreamer ||
        !this.currentSyrup
      ) {
        return "Please complete all beverage options and the name before making a beverage.";
      }

      addDoc(collection(db, "beverages"), {
        user: this.user.uid,
        name: this.currentName,
        temp: this.currentTemp,
        base: this.currentBase,
        syrup: this.currentSyrup,
        creamer: this.currentCreamer,
      });

      const tempname = this.currentName;
      this.currentName = "";

      return "Beverage " + tempname + " made successfully!";
    },

    showBeverages() {
      this.beverages = [];

      if (!this.user) return;

      const userBevs = query(
        collection(db, "beverages"),
        where("user", "==", this.user.uid)
      );

      onSnapshot(userBevs, (snapshot) => {
        this.beverages = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            name: data.name,
            temp: data.temp,
            base: data.base,
            syrup: data.syrup,
            creamer: data.creamer,
          };
        });
      });
    },

    clearBeverages() {
      this.beverages = [];
    },

    showBeverage(beverage: BeverageType) {
      this.currentTemp = beverage.temp;
      this.currentBase = beverage.base;
      this.currentCreamer = beverage.creamer;
      this.currentSyrup = beverage.syrup;
      this.currentName = beverage.name;
    },
  },
});

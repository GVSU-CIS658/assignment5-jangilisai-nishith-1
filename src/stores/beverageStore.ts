import { defineStore } from "pinia";
import {
  BaseBeverageType,
  CreamerType,
  SyrupType,
  BeverageType,
} from "../types/beverage";
import tempretures from "../data/tempretures.json";
import {db} from "../firebase.ts";
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import {
  type User,
} from 'firebase/auth'


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
      onSnapshot(collection(db, "bases"), (snapshot) =>{
        this.bases = snapshot.docs.map((doc) =>{
          const data = doc.data();
          const base: BaseBeverageType = {
            id: doc.id,
            name: data.name,
            color: data.color,
          };
          return base;
        });
        this.currentBase = this.bases[1];
      });
      
      onSnapshot(collection(db, "creamers"), (snapshot) =>{
        this.creamers = snapshot.docs.map((doc) =>{
          const data = doc.data();
          const creamer: CreamerType = {
            id: doc.id,
            name: data.name,
            color: data.color,
          };
          return creamer;
        });
        this.currentCreamer = this.creamers[1];
      });


      onSnapshot(collection(db, "syrups"), (snapshot) =>{
        this.syrups = snapshot.docs.map((doc) =>{
          const data = doc.data();
          const syrup: SyrupType = {
            id: doc.id,
            name: data.name,
            color: data.color,
          };
          return syrup;
        });
        this.currentSyrup = this.syrups[1];
      });
    },

    setUser(user: User | null){
      this.user = user;
      this.showBeverages();
    },

    makeBeverage() {
      if (!this.currentName) return "Please input a name.";

      addDoc(collection(db, "beverages"),{
          user: this.user?.uid,
          name: this.currentName,
          temp: this.currentTemp,
          base: this.currentBase,
          syrup: this.currentSyrup,
          creamer: this.currentCreamer,
      });
      this.showBeverages();
      const tempname = this.currentName;
      this.currentName = "";
      return "Beverage "+ tempname+ " made successfully!"
    },

    showBeverages(){
      this.beverages = [];
      const userBevs = query(
        collection(db, "beverages"),
        where("user", "==", this.user?.uid)
      );
      let count = 0;
      onSnapshot(userBevs, (snapshot) => {
        this.beverages = snapshot.docs.map((doc) => {
          const data = doc.data();

          const beveragesdb: BeverageType = {
            id: count,
            name: data.name,
            temp: data.temp,
            base: data.base,
            syrup: data.syrup,
            creamer: data.creamer,
          };
          count++;
          return beveragesdb;
        });
      });
    },
    clearBeverages(){
      this.beverages = [];
    },
    showBeverage(beverage: BeverageType) {
      this.currentTemp = beverage.temp;
      this.currentBase = beverage.base;
      this.currentCreamer = beverage.creamer;
      this.currentSyrup = beverage.syrup;

    },

  },
});

import { FetchWrapper } from "./fetch-wrapper";
import snackbar from "snackbar";
import "snackbar/dist/snackbar.min.css";
import Chart from "chart.js/auto";

const API = new FetchWrapper(
  "https://firestore.googleapis.com/v1/projects/programmingjs-90a13/databases/(default)/documents/"
);

const ctx = document.getElementById("myChart").getContext("2d");
const form = document.querySelector("form");
const totalCalories = document.querySelector(".totalCalories");
const foodLog = document.querySelector(".itsaFoodLog");
let myChart;

const getTotalCalories = (carbs, fat, protein) => {
  return Number(carbs) * 4 + Number(fat) * 9 + Number(protein) * 4;
};

// snackbar.show(result); Use for later

const chartMaker = (carbs, fat, protein) => {
  myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Carbs", "Fat", "Protein"],
      datasets: [
        {
          label: "Healh Information",
          data: [carbs, fat, protein],
          backgroundColor: [
            "rgba(34, 0, 255, 0.2)",
            "rgba(221, 0, 255, 0.2)",
            "rgba(255, 21, 0, 0.2)",
          ],
          borderColor: [
            "rgba(34, 0, 255, 1)",
            "rgba(221, 0, 255, 1)",
            "rgba(255, 21, 0, 1)",
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
};

const postIt = (carbs, fat, protein, foodInput) => {
  let body = {
    fields: {
      carbs: {
        integerValue: carbs,
      },
      fat: {
        integerValue: fat,
      },
      protein: {
        integerValue: protein,
      },
      foodInput: {
        stringValue: foodInput,
      },
    },
  };

  return API.post("itsaFoodApp9", body);
};

const foodInfo = () => {
  API.get("itsaFoodApp9").then((data) => {
    let totalCarbs = 0;
    let totalFat = 0;
    let totalProtein = 0;
    if (data.documents) {
      data.documents.forEach(({ fields: { carbs, fat, protein } }) => {
        let carbNumber = Number(carbs.integerValue);
        let fatNumber = Number(fat.integerValue);
        let proNumber = Number(protein.integerValue);
        totalCarbs = carbNumber + totalCarbs;
        totalFat = fatNumber + totalFat;
        totalProtein = proNumber + totalProtein;
        totalCalories.innerHTML = `${getTotalCalories(
          totalCarbs,
          totalFat,
          totalProtein
        )}`;
      });
      chartMaker(totalCarbs, totalFat, totalProtein);
      foodLog.innerHTML = data.documents
        .map(
          ({
            // fields: { carbs: { integerValue: carbValue }, fat: { integerValue: fatValue }, protein: { integerValue: proValue }, foodInput: { stringValue: foodValue } },  destructuring down to smallest level, replaces need for carbs.integervalue etc etc
            fields: { carbs, fat, protein, foodInput },
          }) => `<div class="sampleItem">
       <h3>${foodInput.stringValue}</h3>
       <p> Total ${getTotalCalories(
         carbs.integerValue,
         fat.integerValue,
         protein.integerValue
       )} kcal</p>
       <div class="healthInfo">
              <div class="carbs">
                <p>Carbs</p>
                <p>${carbs.integerValue} g</p>
              </div>
              <div class="fat">
                <p>Fat</p>
                <p>${fat.integerValue} g</p>
              </div>
              <div class="protein">
                <p>Protein</p>
                <p>${protein.integerValue} g</p>
              </div>
            </div>
     </div>`
        )
        .join("");
    }
  });
};

const totalActivation = (e) => {
  e.preventDefault();
  const foodInput = document.querySelector("#foodInput").value;
  const carbsInput = document.querySelector("#carbsInput").value;
  const fatInput = document.querySelector("#fatInput").value;
  const proInput = document.querySelector("#proInput").value;

  if (foodInput !== "Select your food" && carbsInput && fatInput && proInput) {
    if (myChart) {
      myChart.destroy();
    }
    postIt(carbsInput, fatInput, proInput, foodInput).then(() => {
      foodInfo();
    });

    snackbar.show("Item added");
  }
};

foodInfo();
form.addEventListener("submit", totalActivation);

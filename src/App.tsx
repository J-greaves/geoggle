import React, { useState, useEffect } from "react";

// Define a type for the country data structure
interface CountryData {
  population: number;
  popDensity: number;
  GDP: number;
  continent: string;
  firstLanguage: string;
  isLandlocked: boolean;
  isUnMember: boolean;
  isCommonwealthMember: boolean;
  isEuMember: boolean;
  isNatoMember: boolean;
  isAfricanUnionMember: boolean;
  isIslamicCooperationMember: boolean;
  isIrenaMember: boolean;
  isIccMember: boolean;
  isNonAlignedMember: boolean;
  [key: string]: any; // This allows any additional string keys
}
let paramReducer: string | null = null; // Initialize paramReducer as null
let searcherArray: string[] = [];

const paramReducers: Array<string> = [
  "isCommonwealthMember",
  "isLandlocked",
  "isEuMember",
  "isNatoMember",
  "isAfricanUnionMember",
  "isIslamicCooperationMember",
  "isIccMember",
  "isNonAlignedMember",
];

// Define a type for challenge types
type ChallengeType =
  | "exactLength"
  | "containVowel"
  | "singleOccurrenceVowel"
  | "endingLetter"
  | "beginningLetter"
  | "membersOf";

// Define a type for challenge objects
interface Challenge {
  type: ChallengeType;
  description: string;
}

// Define the challenges array with proper type
const challenges: Challenge[] = [
  {
    type: "exactLength",
    description: "X countries contain exactly * letters.",
  },
  {
    type: "containVowel",
    description: "X countries contain the vowel '*'.",
  },
  {
    type: "singleOccurrenceVowel",
    description: "X countries contain only one occurrence of the vowel '*'.",
  },
  {
    type: "endingLetter",
    description: "X countries end with the letter '*'.",
  },
  {
    type: "beginningLetter",
    description: "X countries begin with the letter '*'.",
  },
  {
    type: "membersOf",
    description: "X countries that are members of '*'.",
  },
];

// Helper function to get a random integer
const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to get a random vowel
const getRandomVowel = (): string =>
  ["a", "e", "i", "o", "u"][Math.floor(Math.random() * 5)];

function getRandomParamReducer(): string {
  const randomIndex = Math.floor(Math.random() * paramReducers.length);
  return paramReducers[randomIndex];
}

// Helper function to get a random letter
const getRandomLetter = (): string =>
  String.fromCharCode(getRandomInt(65, 90)).toLowerCase();

// Define the function to check the challenge and return the matching countries
function checkChallenge(
  challenge: Challenge,
  countriesData: Record<string, CountryData>
): { answers: string[]; replacementValue: string | number | null } {
  const answers: string[] = [];
  let replacementValue: string | number | null = null; // Declare the replacement value

  switch (challenge.type) {
    case "exactLength": {
      replacementValue = getRandomInt(3, 10);
      for (const country in countriesData) {
        if (country.length === replacementValue) {
          answers.push(country);
        }
      }
      break;
    }
    case "containVowel": {
      replacementValue = getRandomVowel();
      for (const country in countriesData) {
        if (country.toLowerCase().includes(replacementValue)) {
          answers.push(country);
        }
      }
      break;
    }
    case "singleOccurrenceVowel": {
      replacementValue = getRandomVowel();
      for (const country in countriesData) {
        const regex = new RegExp(
          `^([^${replacementValue}]*)(${replacementValue})([^${replacementValue}]*$)`
        );
        if (regex.test(country.toLowerCase())) {
          answers.push(country);
        }
      }
      break;
    }
    case "endingLetter": {
      replacementValue = getRandomLetter();
      for (const country in countriesData) {
        if (country.toLowerCase().endsWith(replacementValue)) {
          answers.push(country);
        }
      }
      break;
    }
    case "beginningLetter": {
      replacementValue = getRandomLetter();
      for (const country in countriesData) {
        if (country.toLowerCase().startsWith(replacementValue)) {
          answers.push(country);
        }
      }
      break;
    }
    default:
      return { answers: [], replacementValue: null };
  }
  return { answers, replacementValue }; // Return answers and the replacement value
}

const App: React.FC = () => {
  // Define states
  const [countriesData, setCountriesData] = useState<
    Record<string, CountryData>
  >({});
  const [challenge, setChallenge] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<boolean | null>(null);
  const [answersImage, setAnswersImage] = useState<string>(
    "../public/cross.png"
  );
  const [numberOfAnswers, setNumberOfAnswers] = useState<number>(0);
  const [correctAnswerCount, setCorrectAnswerCount] = useState<number>(0); // Track correct answers
  const [notHadFirstGuess, setNotHadFirstGuess] = useState<boolean>(true);

  // Fetch country data from the JSON file when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("../public/countryData.json");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setCountriesData(data);
      } catch (error) {
        console.error("Error fetching country data:", error);
      }
    };

    fetchData();
  }, []);

  const generateChallenge = (): void => {
    setNotHadFirstGuess(true);
    let validChallenge: Challenge | null = null;
    let matchingCountries: string[] = [];
    paramReducer = null; // Reset paramReducer before generating a new challenge
    setCorrectAnswerCount(0);

    const maxAttempts = 100; // Limit to avoid infinite loop

    let attempt = 0;
    do {
      searcherArray = [];
      paramReducer = null;
      if (attempt >= maxAttempts) {
        console.warn("Max attempts reached, no valid challenge found.");
        return; // Prevents infinite loop
      }

      // Choose a random core challenge
      const randomChallenge =
        challenges[getRandomInt(0, challenges.length - 1)];
      const { answers, replacementValue } = checkChallenge(
        randomChallenge,
        countriesData
      );

      // Start with the matching countries from the core challenge
      matchingCountries = answers;

      // Only apply paramReducer if there are more than 8 countries
      if (matchingCountries.length > 8) {
        paramReducer = getRandomParamReducer(); // Get a random param reducer
        let searcher: string;
        if (paramReducer) {
          searcher = paramReducer;
          searcherArray.push(searcher);
        }
        // Apply the paramReducer to filter countries
        matchingCountries = matchingCountries.filter((country) => {
          return countriesData[country][searcher] === true; // Keep countries that meet the additional condition
        });

        // If after applying paramReducer we get fewer than 2 countries, reset and retry
        if (matchingCountries.length < 2) {
          paramReducer = null; // Don't apply paramReducer
          continue; // Retry with a new challenge
        }
        if (matchingCountries.length > 8) {
          paramReducer = getRandomParamReducer(); // Get a random param reducer
          let searcher: string;
          if (paramReducer) {
            searcher = paramReducer;
            searcherArray.push(searcher);
          }
          matchingCountries = matchingCountries.filter((country) => {
            return countriesData[country][searcher] === true; // Keep countries that meet the additional condition
          });
        }
      }

      // Ensure the final result is between 2 and 8 countries
      if (matchingCountries.length >= 2 && matchingCountries.length <= 8) {
        validChallenge = randomChallenge;

        // Ensure we replace X and * with the latest values
        if (validChallenge) {
          const challengeDescription = validChallenge.description
            .replace("X", matchingCountries.length.toString())
            .replace("*", String(replacementValue).toUpperCase()); // Replacing '*' with the criteria

          setChallenge(challengeDescription); // Set the challenge
          setAnswers(matchingCountries); // Set the answers
        }
      }
      setNumberOfAnswers(matchingCountries.length);
      attempt++;
    } while (!validChallenge); // Continue until we find a valid challenge
  };

  const addedText: string[] = [];

  searcherArray.forEach((searcher) => {
    if (searcher === "isLandlocked") {
      addedText.push("are Landlocked");
    }
    if (searcher === "isIccMember") {
      addedText.push("are members of the International Criminal Court");
    }
    if (searcher === "isCommonwealthMember") {
      addedText.push("are members of The Commonwealth");
    }
    if (searcher === "isEuMember") {
      addedText.push("are members of The European Union");
    }
    if (searcher === "isIslamicCooperationMember") {
      addedText.push("are members of The Non-Aligned Movement");
    }
    if (searcher === "isAfricanUnionMember") {
      addedText.push("are members of The African Union");
    }
    if (searcher === "isNatoMember") {
      addedText.push("are members of The North Atlantic Treaty Organization");
    }
    if (searcher === " and ") {
      addedText.push(" and ");
    }
  });
  const handleSubmit = (event: any) => {
    event.preventDefault();
    setNotHadFirstGuess(false);
    const input: string = event.currentTarget.querySelector("input").value;

    if (answers.includes(input)) {
      setCorrectAnswer(true);
      setCorrectAnswerCount((prev) => prev + 1); // Increment correct answer count
      const updatedAnswers = answers.filter((answer) => answer !== input);
      setAnswers(updatedAnswers);
    } else {
      setAnswersImage("../public/cross.png"); // Only change this if needed
      setCorrectAnswer(false);
    }
    event.currentTarget.querySelector("input").value = "";
    console.log(answers);
  };
  return (
    <div
      style={{
        height: "100vh", // Ensure it takes the full height of the viewport
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "50px",
      }}
    >
      <h1>Geography Game</h1>
      <button onClick={generateChallenge}>Generate Today's Challenge</button>
      {challenge && (
        <>
          <h2>
            {addedText.length > 0
              ? `${challenge.slice(0, -1)} and ${addedText.join(" and ")}`
              : challenge}
          </h2>
          {notHadFirstGuess === null ? (
            <p></p>
          ) : correctAnswer === true ? (
            <p>Correct Answer: Countries remaing = {answers.length}</p>
          ) : (
            <p>Incorrect Answer: Countries remaing = {answers.length}</p>
          )}
          {answers.length > 0 ? (
            <form onSubmit={handleSubmit}>
              <input type="text"></input>
              <button type="submit">Submit</button>
            </form>
          ) : null}
          <p>
            {Array.from({ length: numberOfAnswers }).map((_, i) => (
              <img
                key={i}
                src={
                  i < correctAnswerCount ? "../public/tick.png" : answersImage
                } // Change based on correct answers
                style={{ width: "10vw", margin: "1rem" }}
                alt={`Answer icon ${i + 1}`}
              />
            ))}
          </p>
          <div>
            {answers.length === 0 ? (
              <p>
                <img src="../public/winner.png"></img>
              </p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default App;

import React, { useState, useEffect } from "react";
import crossImage from "../public/cross.png";
import tickImage from "../public/tick.png";
import winnerImage from "../public/winner.png";
import logo from "../public/logo.png";

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
  [key: string]: any;
}
let paramReducer: string | null = null;
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

type ChallengeType =
  | "exactLength"
  | "containVowel"
  | "singleOccurrenceVowel"
  | "endingLetter"
  | "beginningLetter"
  | "membersOf";

interface Challenge {
  type: ChallengeType;
  description: string;
}

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

const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomVowel = (): string =>
  ["a", "e", "i", "o", "u"][Math.floor(Math.random() * 5)];

function getRandomParamReducer(): string {
  const randomIndex = Math.floor(Math.random() * paramReducers.length);
  return paramReducers[randomIndex];
}

const getRandomLetter = (): string =>
  String.fromCharCode(getRandomInt(65, 90)).toLowerCase();

function checkChallenge(
  challenge: Challenge,
  countriesData: Record<string, CountryData>
): { answers: string[]; replacementValue: string | number | null } {
  const answers: string[] = [];
  let replacementValue: string | number | null = null;

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
  return { answers, replacementValue };
}

const App: React.FC = () => {
  // Define states
  const [countriesData, setCountriesData] = useState<
    Record<string, CountryData>
  >({});
  const [challenge, setChallenge] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<boolean | null>(null);
  const [answersImage, setAnswersImage] = useState<string>(crossImage);
  const [numberOfAnswers, setNumberOfAnswers] = useState<number>(0);
  const [correctAnswerCount, setCorrectAnswerCount] = useState<number>(0);
  const [notHadFirstGuess, setNotHadFirstGuess] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/countryData.json");
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
    paramReducer = null;
    setCorrectAnswerCount(0);

    const maxAttempts = 100;

    let attempt = 0;
    do {
      searcherArray = [];
      paramReducer = null;
      if (attempt >= maxAttempts) {
        console.warn("Max attempts reached, no valid challenge found.");
        return;
      }

      const randomChallenge =
        challenges[getRandomInt(0, challenges.length - 1)];
      const { answers, replacementValue } = checkChallenge(
        randomChallenge,
        countriesData
      );

      matchingCountries = answers;

      if (matchingCountries.length > 8) {
        paramReducer = getRandomParamReducer();
        let searcher: string;
        if (paramReducer) {
          searcher = paramReducer;
          searcherArray.push(searcher);
        }

        matchingCountries = matchingCountries.filter((country) => {
          return countriesData[country][searcher] === true;
        });

        if (matchingCountries.length < 2) {
          paramReducer = null;
          continue;
        }
        if (matchingCountries.length > 8) {
          paramReducer = getRandomParamReducer();
          let searcher: string;
          if (paramReducer) {
            searcher = paramReducer;
            searcherArray.push(searcher);
          }
          matchingCountries = matchingCountries.filter((country) => {
            return countriesData[country][searcher] === true;
          });
        }
      }

      if (matchingCountries.length >= 2 && matchingCountries.length <= 8) {
        validChallenge = randomChallenge;

        if (validChallenge) {
          const challengeDescription = validChallenge.description
            .replace("X", matchingCountries.length.toString())
            .replace("*", String(replacementValue).toUpperCase());

          setChallenge(challengeDescription);
          setAnswers(matchingCountries);
        }
      }
      setNumberOfAnswers(matchingCountries.length);
      attempt++;
    } while (!validChallenge);
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
      setCorrectAnswerCount((prev) => prev + 1);
      const updatedAnswers = answers.filter((answer) => answer !== input);
      setAnswers(updatedAnswers);
    } else {
      setAnswersImage(crossImage);
      setCorrectAnswer(false);
    }
    event.currentTarget.querySelector("input").value = "";
    console.log(answers);
  };
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        textAlign: "center",
        padding: "50px",
      }}
    >
      <h1>
        <img src={logo}></img>
      </h1>
      <button
        onClick={generateChallenge}
        style={{ width: "10vw", minWidth: "100px", alignSelf: "center" }}
      >
        Generate a Challenge
      </button>
      {challenge && (
        <>
          <h2>
            {answers.length === 0
              ? null
              : addedText.length > 0
              ? `${challenge.slice(0, -1)} and ${addedText.join(" and ")}`
              : challenge}
          </h2>
          {answers.length === 0 ? null : notHadFirstGuess ? (
            <p>Make your guess!</p>
          ) : correctAnswer === true ? (
            <p>Correct Answer: Countries remaining = {answers.length}</p>
          ) : correctAnswer === false ? (
            <p>Incorrect Answer: Countries remaining = {answers.length}</p>
          ) : null}
          {answers.length > 0 ? (
            <form onSubmit={handleSubmit}>
              <input type="text"></input>
              <button type="submit">Submit</button>
            </form>
          ) : null}
          {answers.length === 0 ? null : (
            <p>
              {Array.from({ length: numberOfAnswers }).map((_, i) => (
                <img
                  key={i}
                  src={i < correctAnswerCount ? tickImage : answersImage}
                  style={{ width: "8vw", minWidth: "60px", margin: "1rem" }}
                  alt={`Answer icon ${i + 1}`}
                />
              ))}
            </p>
          )}
          <div>
            {answers.length === 0 ? (
              <p>
                <img src={winnerImage}></img>
              </p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default App;

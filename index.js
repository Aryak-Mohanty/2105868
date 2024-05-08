const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const windowSize = 10;
let numbers = [];
const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE1MTQ5OTE1LCJpYXQiOjE3MTUxNDk2MTUsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjA0YjRhNGM0LTdkNTMtNGJjYy05OTI5LTdiNGI5MDJkNDA1YiIsInN1YiI6IjIxMDU4NjhAa2lpdC5hYy5pbiJ9LCJjb21wYW55TmFtZSI6ImFmZm9yZG1lZCIsImNsaWVudElEIjoiMDRiNGE0YzQtN2Q1My00YmNjLTk5MjktN2I0YjkwMmQ0MDViIiwiY2xpZW50U2VjcmV0IjoiZ1p0bmVmSkpvdkt5bHphaiIsIm93bmVyTmFtZSI6IkFyeWFrIE1vaGFudHkiLCJvd25lckVtYWlsIjoiMjEwNTg2OEBraWl0LmFjLmluIiwicm9sbE5vIjoiMjEwNTg2OCJ9.dU210xA9oELAcYph7BVraXQWIOH_e19acb7VKCFOsBo";

const fetchNumbers = async (type) => {
  try {
    const response = await axios.get(`http://20.244.56.144/test/${type}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data.numbers;
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.error("Conflict fetching numbers:", error.response.data);
    } else {
      console.error("Error fetching numbers:", error.message);
    }
    return [];
  }
};

const calculateAverage = (arr) => {
  const sum = arr.reduce((acc, curr) => acc + curr, 0);
  return sum / arr.length;
};

app.get("/numbers/:numberid", async (req, res) => {
  const { numberid } = req.params;

  let newNumbers;
  switch (numberid) {
    case "p":
      newNumbers = await fetchNumbers("primes");
      break;
    case "f":
      newNumbers = await fetchNumbers("fibo");
      break;
    case "e":
      newNumbers = await fetchNumbers("even");
      break;
    case "r":
      newNumbers = await fetchNumbers("random");
      break;
    default:
      return res.status(400).json({ error: "Invalid number ID" });
  }

  numbers = [...new Set([...numbers, ...newNumbers])];

  if (numbers.length > windowSize) {
    numbers = numbers.slice(numbers.length - windowSize);
  }

  let avg = null;
  if (numbers.length === windowSize) {
    avg = calculateAverage(numbers);
  }

  const response = {
    windowPrevState: numbers.slice(0, numbers.length - newNumbers.length),
    windowCurrState: numbers,
    numbers: newNumbers,
    avg: avg,
  };

  res.json(response);
});

const PORT = process.env.PORT || 9876;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

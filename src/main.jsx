import { StrictMode } from "react"; //, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

//import StarRating from "./components/StarRating.jsx";

/*function Test() {
  /* instead of lifting the rating state, we passed the setMovieRating function in as a prop and have the child component update
  the movieRating for this test component whenever the internal star rating is updated
  const [movieRating, setMovieRating] = useState(0);
  return (
    <div>
      <StarRating color="blue" maxRating={10} onSetRating={setMovieRating} />
      <p> this movie was rated {movieRating} stars</p>
    </div>
  );
}*/

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    {/*<StarRating
      maxRating={5}
      messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
    />
    <StarRating size={24} color="red" className="test" defaultRating={3} />
    <Test />*/}
  </StrictMode>
);

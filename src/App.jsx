import { useEffect, useState } from "react";
import { WatchedMovieList } from "./components/WatchedMovieList";
import { WatchedSummary } from "./components/WatchedSummary";
import { MovieDetails } from "./components/MovieDetails";
import { MovieList } from "./components/MovieList";
import { Box } from "./components/Box";
import { Loader } from "./components/Loader";
import { Search } from "./components/Search";
import { NumResults } from "./components/NumResults";
import { NavBar } from "./components/NavBar";
import { ErrorMessage } from "./components/ErrorMessage";

export const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export const KEY = "d826a939";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("inception");
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  /* the following console.logs will print in the following order
  
  C will print first as effects come after a browser paint but render logic occurs during render.
  A and D will print next in this order simply because A appears first in the code

  if I were to clear the console and type a letter into the search box
  C will appear followed by B, A does not print. C will get logged because of a re-render
  B will get logged because its effect has no dependency array, which means the effect will be synchronized with everything
  A does not print because it's dependency array is blank, it has no dependecies so it won't be ran 

  adding in D now, D will print any time the query state is updated

  // After initial render
  useEffect(function () {
    console.log("A");
  }, []);

  // After every render
  useEffect(function () {
    console.log("B");
  });

  // During Render
  console.log("C");

  // After query state has an update
  useEffect(() => {
    console.log("D");
  }, [query]);
  */

  /* use effect is used to register an effect, it contains the side effect we want to register and let's us
  run this code not as the component gets rendered but after it has already been painted onto the screen*/
  /*useEffect(function () {
    fetch(`http://www.omdbapi.com/?i=tt3896198&apikey=${KEY}&s=interstellar`)
      .then((res) => res.json())
      .then((data) => setMovies(data.Search));
  }, []);*/

  function handleSelectMovie(id) {
    if (id === selectedId) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
    }
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  useEffect(
    function () {
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`
          );

          if (!res.ok)
            throw new Error("Something went wrong with fetching movies");

          const data = await res.json();

          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);
          // at this point the state will still be stale
          /* console.log(movies); */
        } catch (err) {
          console.log(err.message);
          setError(err.message);
        } finally {
          // finally will always run when a promise is settled whether fulfilled or rejected
          setIsLoading(false);
        }
      }

      // If we have less than 3 characters in the search bar we don't want to perform the fetch
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      fetchMovies();
    },
    // the effect will react when this state updates
    [query]
  );

  /* we never want to set state inside of a components render logic, this is an infinite loop of state setting
  where the component will keep re-rendering
  fetch(`http://www.omdbapi.com/?i=tt3896198&apikey=${KEY}&s=interstellar`)
    .then((res) => res.json())
    .then((data) => setMovies(data.Search)); 
    
  infinite loop
  setWatched([])*/

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <div className="main">
        <Box>
          {/*error ? error : isLoading ? <Loader /> : <MovieList movies={movies} />*/}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} />
            </>
          )}
        </Box>
      </div>
    </>
  );
}

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

export const KEY = "d826a939";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  //const [watched, setWatched] = useState([]);

  /* we can pass a callback function into a useState hook so long as it's a pure function
  like always, the useState hook will only consider the initial value during initial render so the
  funciton will only run once. we should never call a function directly in useState (like below)
  instead we will always pass in a callback function.
  Even though react would ignore the value of this, would still perform the call every render
  useState(localStorage.getItem("watched")); 
  */
  const [watched, setWatched] = useState(() => {
    const storedValue = JSON.parse(localStorage.getItem("watched"));
    return storedValue;
  });

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

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);

    /* doing this an an effect will be better as we can make is reusable
   localStorage.setItem("watched", JSON.stringify([...watched, movie]));*/
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  /* having a useEffect hook for local storage automatically accounts for adding and deleting as it
  fires whenever watched is updated*/
  useEffect(() => {
    localStorage.setItem("watched", JSON.stringify(watched));
  }, [watched]);

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
        } catch (err) {
          console.log(err.message);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      handleCloseMovie();
      const timer = setTimeout(fetchMovies, 500);

      return function () {
        clearTimeout(timer);
      };
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <div className="main">
        <Box>
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
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </div>
    </>
  );
}

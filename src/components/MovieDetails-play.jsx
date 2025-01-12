import { useState, useEffect } from "react";
import { KEY } from "../App-v2";
import { Loader } from "./Loader";
import StarRating from "./StarRating";

export function MovieDetails({
  selectedId,
  onCloseMovie,
  onAddWatched,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const isWatched = watched.find((movie) => movie.imdbID === selectedId);
  const watchedUserRating = isWatched?.userRating;

  // deconstruct the movie so that we don't have to use capitals when dealing with the watched movies
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating: imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  /*this willl break the app as we are breaking the number one rule for hooks, we 
  must always call them at the top level otherwise we will break the linked list of hooks
  if (imdbRating > 8) [isTop, setIsTop] = useState(true);*/

  /* this can be another issue where an early return can break out hooks linked list,
  make sure early returns are done AFTER all hook calls
  if (imdbRating > 8) return <p>Greatest ever!</p>;*/

  /* this would not work because the initial state we pass in is only looked at during the initial render,
  during first mount the imdbRating would be undefined so this would be false and it will always stay
  false as we are not setting it anywhere else
  const [isTop, setIsTop] = useState(imdbRating > 8);
  console.log(isTop);*/
  /* this useEffect can be used to fix our isTop being false problem from above 
  useEffect(() => {
    setIsTop(imdbRating > 8);
  }, [imdbRating]);*/

  /* this would be the best solution for the above problem, we don't even need state we can just use derived state 
  to figure out isTop*/
  const isTop = imdbRating > 8;
  console.log(isTop);

  const [avgRating, setAvgRating] = useState(0);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: runtime.split(" ").at(0),
      userRating,
    };

    onAddWatched(newWatchedMovie);
    //onCloseMovie();

    /* avgRating will still be 0 because the state is set asynchronously, we do not have access to the updated state right
    after calling the state updating function*/
    setAvgRating(Number(imdbRating));
    //alert(avgRating);
    /* The average will be wrong because our avgRating here will still be 0
    if we our user rating was 10 it would be (0 + 10)/2 = 5
    again because sate setting is asynchronous this will not work, the state is stale*/
    //setAvgRating((avgRating + userRating) / 2);
    /* using a callback function we can gain access to the new value and properly use it*/
    setAvgRating((avgRatingCurr) => (avgRatingCurr + userRating) / 2);
  }

  useEffect(
    function () {
      function keydownEscape(e) {
        if (e.code === "Escape") {
          onCloseMovie();
        }
      }

      document.addEventListener("keydown", keydownEscape);
      return function () {
        /* We want to remove the event listener on every close otherwise they will keep piling up
        with every new movie we open. We also don't want the keydown event active when we are on the home page so we need to 
        remove it for that reason as well.*/
        document.removeEventListener("keydown", keydownEscape);
      };
    },
    [onCloseMovie]
  );

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );

        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }

      getMovieDetails();
    },
    /* This effect needs to be performed whenever the selectedId state has a change*/
    [selectedId]
  );

  useEffect(
    function updateTitle() {
      if (!title) return;
      document.title = `Movie | ${title}`;

      /* After closing a movie, this side effect will still be occuring, this is a usecase for when I may 
      want to use the clean up function
      
      The cleanUp function, despite running after the component has unmounted, still knows what the title is.
      This is because of closure in JS. title was already created by the time the effect was first created.
      So even after the component has already unmounted, the useEFfect function has already closed over the title variable
      thus allowing cleanUp to still access it

      When switching to a different movie, React will cleanUp from the previous movie
      */
      return function cleanUp() {
        document.title = "usePopcorn";
        //console.log(`Clean up effect for movie ${title}`);
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <img src={poster} alt={`poster of ${movie}`} />

            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>

          <p>{avgRating}</p>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  you rated this movie {watchedUserRating} <span>🌟</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
          <button className="btn-back" onClick={onCloseMovie}>
            &larr; {/*left arrow*/}
          </button>
        </>
      )}
    </div>
  );
}

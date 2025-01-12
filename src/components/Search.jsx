import { useEffect, useRef } from "react";

export function Search({ query, setQuery }) {
  /* while this will work for getting focus of search bar, this is not React way of doing things. This is because if the element
  didn't have a class name we would have to add it. If the effect has a depedency then we could be reselecting the element over and over 
  which isn't ideal. To make selecting elements more declarative like the rest of React we use refs.
  useEffect(() => {
    const el = document.querySelector(".search");
    console.log(el);
    el.focus();
  }, []);*/

  // typically will use null if we are getting a DOM element
  const inputEl = useRef(null);

  /* need to use an effect when using a ref that contains a DOM element like we have here
  because the ref only gets added to the dom element after the dom has already loaded an effect only runs
  after the dom has been loaded as well. */
  useEffect(() => {
    /* we can see that the inputEl.current is our actual search element 
    console.log(inputEl.current);*/
    inputEl.current.focus();
  }, []);

  useEffect(
    function () {
      function keydownReturn(e) {
        if (e.code === "Enter") {
          if (document.activeElement === inputEl.current) return;
          inputEl.current.focus();
          setQuery("");
        }
      }
      document.addEventListener("keydown", keydownReturn);
      return () => {
        document.removeEventListener("keydown", keydownReturn);
      };
    },
    [setQuery]
  );

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

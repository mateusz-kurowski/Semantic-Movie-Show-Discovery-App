"use client";
import MainSearchComponent from "./main-search";
import PopularMovies from "./popuilar-movies";

const MainSearchContainer = () => {
  return (
    <main className="flex flex-col items-center p-5 gap-5">
      <h2 className="text-4xl font-bold">Find a film for any mood.</h2>
      <MainSearchComponent />
      <PopularMovies />
    </main>
  );
};

export default MainSearchContainer;

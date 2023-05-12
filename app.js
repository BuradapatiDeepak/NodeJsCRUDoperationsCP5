const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

//dataBase and Server initialization

const initializingDBAndServer = async () => {
  try {
    //dataBase initialization

    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    //server initialization

    app.listen(3000, () => {
      console.log("Server Created Successfully");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializingDBAndServer();

//API 1 - Returns list of all movie names from table

app.get("/movies/", async (request, response) => {
  const moviesListQuery = `
    SELECT * FROM movie ;`;
  const moviesList = await db.all(moviesListQuery);
  //response.send(moviesList);
  const newMoviesList = [];
  for (let eachMovie of moviesList) {
    let object = {
      movieName: eachMovie.movie_name,
    };
    newMoviesList.push(object);
  }
  response.send(newMoviesList);
});

//API 2 - Create a new movie in the movie table

app.post("/movies/", async (request, response) => {
  const bodyContent = request.body;
  const { directorId, movieName, leadActor } = bodyContent;
  const postQuery = `
    INSERT INTO movie(director_id, movie_name, lead_actor) 
    VALUES(${directorId}, '${movieName}', '${leadActor}');`;
  await db.run(postQuery);
  response.send("Movie Successfully Added");
});

//API 3 - Returning movie based on the movie ID

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `
    SELECT * FROM movie WHERE movie_id = ${movieId}; `;
  const singleMovie = await db.get(movieQuery);
  // console.log(singleMovie.movie_id - 45);
  response.send({
    movieId: singleMovie.movie_id,
    directorId: singleMovie.director_id,
    movieName: singleMovie.movie_name,
    leadActor: singleMovie.lead_actor,
    //singleMovie,
  });
});

//API 4 - Updates the details of a movie in the movie table
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const bodyContent = request.body;
  const { directorId, movieName, leadActor } = bodyContent;
  const updateQuery = `
    UPDATE movie 
    SET director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

//API 5 - Deletes a movie from movie table
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId};`;
  db.run(deleteQuery);
  response.send("Movie Removed");
});

//API 6 - Returns a list of all directors in the director table
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * FROM director; `;
  const directorsList = await db.all(getDirectorsQuery);
  const newDirectorList = directorsList.map((eachDirector) => ({
    directorId: eachDirector.director_id,
    directorName: eachDirector.director_name,
  }));
  response.send(newDirectorList);
});

//API 7 - Returns a list of movie names directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorMoviesQuery = `
    SELECT * FROM movie WHERE director_id = ${directorId}
    ORDER BY movie_id;`;
  let directorMovies = await db.all(directorMoviesQuery);
  const directorMoviesList = [];
  for (let eachMovie of directorMovies) {
    let object = {
      movieName: eachMovie.movie_name,
    };
    directorMoviesList.push(object);
  }
  response.send(directorMoviesList);
});

module.exports = app;

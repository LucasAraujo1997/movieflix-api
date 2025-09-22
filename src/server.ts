import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/movies", async (_, res) => {
  const movies = await prisma.movie.findMany({
    orderBy: {
      title: "asc",
    },
    include: {
      genres: true,
      language: true,
    },
  });
  res.json(movies);
});

app.post("/movies", async (req, res) => {
  const { title, genre_id, language_id, oscar_count, release_date } = req.body;
  try {
    const movieWithSameTitle = await prisma.movie.findFirst({
      where: {
        title: { equals: title, mode: "insensitive" },
      },
    });

    if (movieWithSameTitle) {
      return res
        .status(409)
        .send({ message: "já existe um filme cadastrado com esse titulo" });
    }

    await prisma.movie.create({
      data: {
        title: title,
        genre_id: genre_id,
        language_id: language_id,
        oscar_count: oscar_count,
        release_date: new Date(release_date),
      },
    });
  } catch (error) {
    return res.status(500).send({
      message: "falha cadastrar o filme",
      errorMessage: error,
    });
  }

  res.status(201).send();
});

app.put("/movies/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const movie = await prisma.movie.findUnique({
      where: {
        id,
      },
    });

    if (!movie) {
      return res.status(404).send({ message: "Filme não encontrado" });
    }

    const data = { ...req.body };

    data.release_date = data.release_date
      ? new Date(req.body.release_date)
      : undefined;

    await prisma.movie.update({
      where: {
        id: id,
      },
      data: data,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "falha ao atualizar registro do filme" });
  }

  res.status(200).send();
});
app.listen(port, () => {
  console.log(
    `Servidor em execução na porta ${port} ou http://localhost:3000/movies `
  );
});

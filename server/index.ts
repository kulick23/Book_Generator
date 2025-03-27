import express, { Request, Response } from 'express';
import cors from 'cors';
import { fakerRU, fakerPL, fakerEN } from '@faker-js/faker';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
app.use(cors());

let faker = fakerEN;

const setLocale = (region: string) => {
  switch (region) {
    case 'ru-RU':
      faker = fakerRU;
      break;
    case 'pl-PL':
      faker = fakerPL;
      break;
    case 'en-US':
    default:
      faker = fakerEN;
      break;
  }
};

app.get('/api/books', (req: Request, res: Response) => {
  const seed = parseInt(req.query.seed as string, 10) || 1;
  const batch = parseInt(req.query.batch as string, 10) || 1;
  const likes = parseFloat(req.query.likes as string) || 0;
  const reviews = parseFloat(req.query.reviews as string) || 0;
  const region = (req.query.region as string) || 'en-US';

  setLocale(region);

  const combinedSeed = seed + batch;
  faker.seed(combinedSeed);

  const recordCount = batch === 1 ? 20 : 10;
  const books = Array.from({ length: recordCount }, (_, i) => {
    const index = (batch - 1) * (batch === 1 ? 20 : 10) + i + 1;

    const bookLikes = Math.round(likes * (Math.random() + 0.5));
    const bookReviews =
      Math.random() < reviews % 1 ? Math.ceil(reviews) : Math.floor(reviews);

    return {
      index,
      isbn: faker.string.numeric(13),
      title: faker.lorem.sentence(),
      author: faker.person.fullName(),
      publisher: faker.company.name(),
      likes: bookLikes,
      reviews: bookReviews,
      cover: faker.image.urlPicsumPhotos({ width: 200, height: 300 }),
    };
  });

  res.json(books);
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

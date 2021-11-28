const monk = require("monk");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const { nanoid } = require("nanoid");

const {
  NOT_FOUND_PATH,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require("./constants");

const app = require("./expressApp");
const schema = require("./schema");

require("dotenv").config();

const db = monk(process.env.MONGODB_URI);
const urls = db.get("urls");

urls.createIndex({ slug: 1 }, { unique: true });

// pass slug to redirect to url
app.get("/:id", async (req, res, next) => {
  const { id: slug } = req.params;

  try {
    // check if doc exist with this slug
    const docWithSlug = await urls.findOne({ slug });
    // if existing redirect to url doc
    if (docWithSlug) return res.redirect(docWithSlug.url);

    return res.status(NOT_FOUND).sendFile(NOT_FOUND_PATH);
  } catch (error) {
    return res.status(NOT_FOUND).sendFile(NOT_FOUND_PATH);
  }
});

// post to mongoDB /urls collection to create shortUrl document
app.post(
  "/urls",
  slowDown({
    windowMs: 30 * 1000,
    delayAfter: 1,
    delayMs: 500,
  }),
  rateLimit({
    windowMs: 30 * 1000,
    max: 1,
  }),
  // insert documents section
  async (req, res, next) => {
    let { slug, url } = req.body;

    try {
      await schema.validate({
        slug,
        url,
      });

      // if not slug, generate one with nanoid
      if (!slug) slug = nanoid(5);
      else {
        // check if slug is existing in the DB documents
        const existing = await urls.findOne({ slug });

        if (existing) throw new Error("Slug already in use, change it please.");
      }

      slug = slug.toLowerCase();
      // create document to insert
      const shortUrlDoc = {
        url,
        slug,
      };

      const docCreated = await urls.insert(shortUrlDoc);

      // send  response to the app
      res.json(docCreated);
    } catch (error) {
      next(error);
    }
  }
);

// not found
app.use((req, res, next) => {
  res.status(NOT_FOUND).sendFile(NOT_FOUND_PATH);
});

//error status
app.use((error, req, res, next) => {
  if (error.status) res.status(error.status);
  else res.status(INTERNAL_SERVER_ERROR);

  res.json({
    message: error.message,
    stack:
      process.env.NODE_ENV === "production"
        ? "we are in production"
        : error.stack,
  });
});

// launched server
const port = process.env.PORT || 1337;

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

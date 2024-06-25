import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import slugify from "slugify";

export const renameProject = async ({ oldTitle, title = "yoyo" }) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  let oldSlugStr = slugify(oldTitle, {
    replacement: "-", // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
    locale: "hk", // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
  });

  let slugStr = slugify(title, {
    replacement: "-", // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
    locale: "hk", // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
  });

  let fromFolder = `${join(
    __dirname,
    "../../",
    "src/effectnode/projects/",
    oldSlugStr,
    "/"
  )}`;

  let toFolder = `${join(
    __dirname,
    "../../",
    "src/effectnode/projects/",
    slugStr,
    "/"
  )}`;

  try {
    await fs.rename(fromFolder, toFolder);
  } catch (e) {
    console.log(e);
  }

  return {};
};
